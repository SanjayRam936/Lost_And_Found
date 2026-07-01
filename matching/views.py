"""
Lost & Found AI — matching engine.

Combines three AI techniques into a single weighted confidence score:
  1. NLP semantic text matching   — sentence-transformers (all-MiniLM-L6-v2)
  2. OCR text extraction          — easyocr, then matched semantically
  3. CV cross-modal / image match — CLIP (openai/clip-vit-base-patch32)

Models are loaded lazily (once, cached in module globals), auto-download from
the Hugging Face hub on first use, and run on GPU when available (CUDA),
falling back to CPU (e.g. on Hugging Face Spaces). Every AI call is guarded so
one failed signal returns 0.0 and never crashes the pipeline.
"""
import math
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

# --- Device detection -------------------------------------------------------
# Guarded so the whole app still boots (with AI signals degrading to 0.0) even
# if torch isn't installed yet — matching the "never crash" error-handling rule.
try:
    import torch
    import torch.nn.functional as F
    _TORCH_OK = True
    device = "cuda" if torch.cuda.is_available() else "cpu"
except Exception as exc:  # pragma: no cover
    torch = None
    F = None
    _TORCH_OK = False
    device = "cpu"
    logger.warning("torch unavailable (%s) — AI signals will return 0.0", exc)

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import generics, status
from django.db.models import Q

from .models import MatchItem, VisibilityAccess
from .serializers import MatchItemSerializer, MatchDetailSerializer
from lost_items.models import LostItems
from found_items.models import FoundItems
from notifications.services import notify


# ════════════════════════════════════════════════════════════════════════════
# LAZY MODEL LOADERS  (load once, cache in module-level globals)
# ════════════════════════════════════════════════════════════════════════════
_sentence_model = None
_ocr_reader = None
_clip_model = None
_clip_processor = None


def get_sentence_model():
    """SentenceTransformer('all-MiniLM-L6-v2'), cached. GPU if available."""
    global _sentence_model
    if _sentence_model is None:
        from sentence_transformers import SentenceTransformer
        _sentence_model = SentenceTransformer('all-MiniLM-L6-v2', device=device)
    return _sentence_model


def get_ocr_reader():
    """easyocr.Reader(['en']), cached. GPU if CUDA is available."""
    global _ocr_reader
    if _ocr_reader is None:
        import easyocr
        # verbose=False suppresses the download progress bar, whose block glyph
        # can crash a non-UTF-8 (Windows cp1252) console with UnicodeEncodeError.
        _ocr_reader = easyocr.Reader(
            ['en'], gpu=bool(_TORCH_OK and torch.cuda.is_available()), verbose=False,
        )
    return _ocr_reader


def get_clip_model():
    """Return (CLIPModel, CLIPProcessor), cached. Model moved to correct device."""
    global _clip_model, _clip_processor
    if _clip_model is None:
        from transformers import CLIPModel, CLIPProcessor
        _clip_model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32").to(device)
        _clip_processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")
    return _clip_model, _clip_processor


# Raw CLIP cosine similarities live in a compressed, low range (text<->image is
# ~0.2-0.35 even for a perfect match; image<->image ~0.5-0.9). We rescale them
# into [0,1] using their effective operating ranges for ViT-B/32 so a genuine
# visual match contributes its full weight instead of ~0.3.
CLIP_CROSS_RANGE = (0.15, 0.32)
CLIP_IMAGE_RANGE = (0.55, 0.95)


def _rescale(x, lo, hi):
    if hi <= lo:
        return max(0.0, min(1.0, x))
    return max(0.0, min(1.0, (x - lo) / (hi - lo)))


# ════════════════════════════════════════════════════════════════════════════
# AI SIGNAL FUNCTIONS  (each returns a float in [0, 1], never raises)
# ════════════════════════════════════════════════════════════════════════════
def compute_semantic_score(text1, text2):
    """TECHNIQUE 1 — semantic similarity of two texts by meaning (NLP)."""
    if not _TORCH_OK or not text1 or not text2:
        return 0.0
    try:
        from sentence_transformers import util
        model = get_sentence_model()
        embeddings = model.encode([text1, text2], convert_to_tensor=True)
        score = float(util.cos_sim(embeddings[0], embeddings[1]))
        return max(0.0, min(1.0, score))
    except Exception as exc:
        logger.warning("semantic score failed: %s", exc)
        return 0.0


def _extract_ocr_text(image_path):
    """Run OCR once on an image and return the concatenated text (or '')."""
    if not _TORCH_OK or not image_path:
        return ''
    try:
        reader = get_ocr_reader()
        results = reader.readtext(image_path, detail=0)
        return ' '.join(results).strip()
    except Exception as exc:
        logger.warning("OCR extraction failed: %s", exc)
        return ''


def compute_ocr_score(image_path, owner_description):
    """TECHNIQUE 2 — extract text from an image, match it to a description."""
    if not owner_description:
        return 0.0
    extracted = _extract_ocr_text(image_path)
    if not extracted:
        return 0.0
    return compute_semantic_score(extracted, owner_description)


def _clip_image_features(image_path):
    """
    Normalized CLIP image embedding (projected 512-d, joint text/image space).

    transformers 5.x's get_image_features returns the raw vision output, so we
    project it explicitly (vision_model.pooler_output -> visual_projection),
    which is exactly the shared-space embedding CLIP compares against text.
    """
    from PIL import Image
    model, processor = get_clip_model()
    image = Image.open(image_path).convert('RGB')
    inputs = processor(images=image, return_tensors="pt")
    inputs = {k: v.to(device) for k, v in inputs.items()}
    with torch.no_grad():
        vision_outputs = model.vision_model(**inputs)
        embeds = model.visual_projection(vision_outputs.pooler_output)
    return F.normalize(embeds, dim=-1)


def _clip_text_features(text):
    """Normalized CLIP text embedding (projected 512-d, joint text/image space)."""
    model, processor = get_clip_model()
    inputs = processor(text=[text], return_tensors="pt", padding=True, truncation=True)
    inputs = {k: v.to(device) for k, v in inputs.items()}
    with torch.no_grad():
        text_outputs = model.text_model(**inputs)
        embeds = model.text_projection(text_outputs.pooler_output)
    return F.normalize(embeds, dim=-1)


def compute_clip_cross_modal(text, image_path):
    """
    TECHNIQUE 3A — cross-modal: compare owner TEXT against finder IMAGE.

    Note: a softmax over a single candidate text is degenerate (always 1.0), so
    we use the cosine similarity of CLIP's shared-space text/image embeddings,
    which is the correct cross-modal comparison for a single pair.
    """
    if not _TORCH_OK or not text or not image_path:
        return 0.0
    try:
        img = _clip_image_features(image_path)
        txt = _clip_text_features(text)
        score = float(F.cosine_similarity(txt, img))
        return _rescale(score, *CLIP_CROSS_RANGE)
    except Exception as exc:
        logger.warning("CLIP cross-modal failed: %s", exc)
        return 0.0


def compute_clip_image_image(image_path1, image_path2):
    """TECHNIQUE 3B — visual similarity between two images (CLIP embeddings)."""
    if not _TORCH_OK or not image_path1 or not image_path2:
        return 0.0
    try:
        emb1 = _clip_image_features(image_path1)
        emb2 = _clip_image_features(image_path2)
        score = float(F.cosine_similarity(emb1, emb2))
        return _rescale(score, *CLIP_IMAGE_RANGE)
    except Exception as exc:
        logger.warning("CLIP image-image failed: %s", exc)
        return 0.0


# ════════════════════════════════════════════════════════════════════════════
# SUPPORTING (non-AI) SCORE FUNCTIONS
# ════════════════════════════════════════════════════════════════════════════
def compute_category_score(lost, found):
    if not lost or not found:
        return 0.0
    return 1.0 if str(lost).strip().lower() == str(found).strip().lower() else 0.0


def compute_color_score(lost, found):
    if not lost or not found:
        return 0.0
    return 1.0 if str(lost).strip().lower() == str(found).strip().lower() else 0.0


def compute_location_score(lat1, lng1, lat2, lng2):
    """Haversine distance → 1.0 at same point, linearly to 0.0 at 5 km."""
    if None in (lat1, lng1, lat2, lng2):
        return 0.0
    try:
        R = 6371.0
        p1 = math.radians(float(lat1))
        p2 = math.radians(float(lat2))
        dphi = math.radians(float(lat2) - float(lat1))
        dlmb = math.radians(float(lng2) - float(lng1))
        a = math.sin(dphi / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dlmb / 2) ** 2
        distance_km = R * 2 * math.asin(math.sqrt(a))
        max_radius = 5.0
        if distance_km >= max_radius:
            return 0.0
        return round(1.0 - (distance_km / max_radius), 4)
    except Exception:
        return 0.0


def compute_time_score(date1, date2):
    """1.0 for same day, linearly to 0.0 at a 30-day gap."""
    if not date1 or not date2:
        return 0.0
    try:
        if not isinstance(date1, datetime):
            date1 = datetime.combine(date1, datetime.min.time())
        if not isinstance(date2, datetime):
            date2 = datetime.combine(date2, datetime.min.time())
        diff_days = abs((date2 - date1).total_seconds()) / 86400.0
        max_days = 30.0
        if diff_days >= max_days:
            return 0.0
        return round(1.0 - (diff_days / max_days), 4)
    except Exception:
        return 0.0


# --- Confidence -------------------------------------------------------------
BASE_WEIGHTS = {
    'semantic':   0.25,   # NLP — description vs description
    'clip_cross': 0.25,   # CV  — owner text vs finder image
    'ocr':        0.10,   # OCR extracted text vs description
    'clip_image': 0.15,   # CV  — image vs image (only when owner has image)
    'category':   0.10,
    'color':      0.08,
    'location':   0.05,
    'time':       0.02,
}


def compute_confidence(scores, owner_has_image):
    """
    Weighted average of all signals. When the owner has NO image, the
    clip_image weight (0.15) is redistributed proportionally across the
    remaining signals so the weights always sum to exactly 1.0.
    """
    weights = dict(BASE_WEIGHTS)
    if not owner_has_image:
        removed = weights.pop('clip_image')
        remaining_total = sum(weights.values())  # 0.85
        if remaining_total > 0:
            for key in weights:
                weights[key] += removed * (weights[key] / remaining_total)

    confidence = 0.0
    for key, weight in weights.items():
        value = float(scores.get(key, 0.0) or 0.0)
        confidence += max(0.0, min(1.0, value)) * weight
    return round(confidence, 4)


def get_match_status(confidence):
    # Calibrated to the real score distribution of the combined AI signals
    # (raw CLIP cosines are low-scale even after rescaling; OCR/color are often
    # absent). A genuine same-item match lands ~0.6-0.8, coincidental pairs
    # ~0.3-0.4. Tune here if you change the weights or rescaling.
    if confidence >= 0.65:
        return 'STRONG'
    if confidence >= 0.50:
        return 'REVIEW'
    return 'PENDING'


# ════════════════════════════════════════════════════════════════════════════
# PIPELINE
# ════════════════════════════════════════════════════════════════════════════
def _image_path(item):
    """Safe filesystem path for an item's image, or None."""
    if item and item.image and item.image.name:
        try:
            return item.image.path
        except Exception:
            return None
    return None


def _score_pair(lost, found, found_ctx):
    """
    Compute every signal for one (lost, found) pair. `found_ctx` carries
    precomputed found-side data (image path, OCR text, CLIP image features) so
    the found item's heavy work is done once per run, not once per lost item.
    """
    lost_desc = lost.description or ''
    found_desc = found.description or ''
    lost_img = _image_path(lost)
    found_img = found_ctx['image_path']

    semantic = compute_semantic_score(lost_desc, found_desc)

    # OCR text was extracted once for the found image; match it semantically.
    ocr = compute_semantic_score(found_ctx['ocr_text'], lost_desc) if found_ctx['ocr_text'] else 0.0

    # CLIP cross-modal: owner text vs finder image (reuse cached image features).
    clip_cross = 0.0
    if _TORCH_OK and found_ctx['image_features'] is not None and lost_desc:
        try:
            txt = _clip_text_features(lost_desc)
            clip_cross = _rescale(float(F.cosine_similarity(txt, found_ctx['image_features'])), *CLIP_CROSS_RANGE)
        except Exception as exc:
            logger.warning("CLIP cross-modal (pipeline) failed: %s", exc)

    # CLIP image-image: only when the owner also uploaded an image.
    clip_image = 0.0
    if _TORCH_OK and lost_img and found_ctx['image_features'] is not None:
        try:
            emb1 = _clip_image_features(lost_img)
            clip_image = _rescale(float(F.cosine_similarity(emb1, found_ctx['image_features'])), *CLIP_IMAGE_RANGE)
        except Exception as exc:
            logger.warning("CLIP image-image (pipeline) failed: %s", exc)

    return {
        'semantic':   semantic,
        'clip_cross': clip_cross,
        'ocr':        ocr,
        'clip_image': clip_image,
        'category':   compute_category_score(lost.category, found.category),
        'color':      compute_color_score(lost.color, found.color),
        'location':   compute_location_score(lost.latitude, lost.longitude, found.latitude, found.longitude),
        'time':       compute_time_score(lost.date, found.date),
    }, bool(lost_img)


def _build_found_context(found_item):
    """Precompute the found item's OCR text and CLIP image features once."""
    found_img = _image_path(found_item)
    ocr_text = _extract_ocr_text(found_img) if found_img else ''
    image_features = None
    if _TORCH_OK and found_img:
        try:
            image_features = _clip_image_features(found_img)
        except Exception as exc:
            logger.warning("CLIP found-image features failed: %s", exc)
    return {'image_path': found_img, 'ocr_text': ocr_text, 'image_features': image_features}


def _persist_match(lost_item, found_item, confidence, scores):
    """
    Create/refresh the MatchItem, grant Vivar Adar visibility to the lost
    item's owner ONLY, and (the first time a pair becomes confident) flag the
    lost item MATCHED and notify its owner. Terminal states are preserved.
    """
    new_status = get_match_status(confidence)
    fields = {
        'confidence_score': confidence,
        'text_score':       round(scores.get('semantic', 0.0), 4),
        'image_similarity': round(max(scores.get('clip_cross', 0.0), scores.get('clip_image', 0.0)), 4),
        'match_location':   round(scores.get('location', 0.0), 4),
        'time_score':       round(scores.get('time', 0.0), 4),
        'status':           new_status,
    }

    match, created = MatchItem.objects.get_or_create(
        lost_item=lost_item, found_item=found_item, defaults=fields,
    )
    prior_status = None
    if not created:
        prior_status = match.status
        if prior_status in ('DISMISSED', 'RESOLVED'):
            return match  # honour terminal states
        for key, value in fields.items():
            setattr(match, key, value)
        match.save()

    # Vivar Adar — only the lost item's owner can ever see this match.
    VisibilityAccess.objects.get_or_create(match=match, user=lost_item.user)

    became_confident = new_status in ('STRONG', 'REVIEW') and prior_status not in ('STRONG', 'REVIEW')
    if became_confident:
        if lost_item.status == 'ACTIVE':
            lost_item.status = 'MATCHED'
            lost_item.save(update_fields=['status'])
        notify(
            lost_item.user, 'MATCH_FOUND', 'AI Match Found',
            f'We found a possible match for your "{lost_item.title}".',
            reference_id=match.id,
        )
    return match


def run_matching_for_found(found_item):
    """Score a found item against all ACTIVE lost items; save the top 5."""
    found_ctx = _build_found_context(found_item)
    lost_items = LostItems.objects.filter(status='ACTIVE')

    scored = []
    for lost in lost_items:
        scores, owner_has_image = _score_pair(lost, found_item, found_ctx)
        confidence = compute_confidence(scores, owner_has_image)
        scored.append((lost, confidence, scores))

    scored.sort(key=lambda t: t[1], reverse=True)
    return [_persist_match(lost, found_item, conf, scores) for lost, conf, scores in scored[:5]]


def run_matching_for_lost(lost_item):
    """Score a newly-created lost item against all found items; save the top 5."""
    found_items = FoundItems.objects.all()
    scored = []
    for found in found_items:
        found_ctx = _build_found_context(found)
        scores, owner_has_image = _score_pair(lost_item, found, found_ctx)
        confidence = compute_confidence(scores, owner_has_image)
        scored.append((found, confidence, scores))

    scored.sort(key=lambda t: t[1], reverse=True)
    return [_persist_match(lost_item, found, conf, scores) for found, conf, scores in scored[:5]]


# ════════════════════════════════════════════════════════════════════════════
# VIEWS
# ════════════════════════════════════════════════════════════════════════════
class RunMatchingView(APIView):
    """POST /matching/run-match/<found_id>/ — run the AI pipeline for a found item."""
    permission_classes = [IsAuthenticated]

    def post(self, request, found_id):
        try:
            found_item = FoundItems.objects.get(id=found_id)
        except FoundItems.DoesNotExist:
            return Response({"error": "Found item not found"}, status=status.HTTP_404_NOT_FOUND)

        saved_matches = run_matching_for_found(found_item)
        serializer = MatchItemSerializer(saved_matches, many=True)
        return Response({
            "message": f"{len(saved_matches)} matches processed",
            "found_item_id": found_id,
            "matches": serializer.data,
        }, status=status.HTTP_201_CREATED)


class MatchResultsView(generics.ListAPIView):
    """GET /matching/results/<found_id>/ — matches for a found item, Vivar Adar scoped."""
    serializer_class = MatchItemSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        accessible = VisibilityAccess.objects.filter(
            user=self.request.user
        ).values_list('match_id', flat=True)
        return MatchItem.objects.filter(
            id__in=accessible, found_item_id=self.kwargs['found_id']
        ).order_by('-confidence_score')


class MyMatchesView(generics.ListAPIView):
    """GET /matching/mine/ — all matches the user can see, with item details."""
    serializer_class = MatchDetailSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        accessible = VisibilityAccess.objects.filter(
            user=self.request.user
        ).values_list('match_id', flat=True)
        return MatchItem.objects.filter(id__in=accessible).exclude(
            status='DISMISSED'
        ).order_by('-confidence_score')


class MatchesForLostView(generics.ListAPIView):
    """GET /matching/for-lost/<lost_id>/ — visible matches for one lost item."""
    serializer_class = MatchDetailSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        accessible = VisibilityAccess.objects.filter(
            user=self.request.user
        ).values_list('match_id', flat=True)
        return MatchItem.objects.filter(
            id__in=accessible, lost_item_id=self.kwargs['lost_id']
        ).exclude(status='DISMISSED').order_by('-confidence_score')


class DismissMatchView(APIView):
    """POST /matching/dismiss/<match_id>/ — dismiss a match (visibility-checked)."""
    permission_classes = [IsAuthenticated]

    def post(self, request, match_id):
        try:
            access = VisibilityAccess.objects.get(match_id=match_id, user=request.user)
        except VisibilityAccess.DoesNotExist:
            return Response({"error": "Access denied"}, status=status.HTTP_403_FORBIDDEN)
        match = access.match
        match.status = 'DISMISSED'
        match.save(update_fields=['status'])
        return Response({"message": "Match dismissed successfully"}, status=status.HTTP_200_OK)
