"""Normalize + extract structured fields for the matching engine, computed once
at submission time so the matcher doesn't recompute them on every request.

All AI/image steps are FAIL-OPEN (return empty on failure)."""
import io
import logging
import re

from .ai_utils import clip_best_label
from .duplicate_detector import image_md5

logger = logging.getLogger(__name__)

_STOPWORDS = {
    'the', 'a', 'an', 'and', 'or', 'of', 'in', 'on', 'at', 'to', 'for', 'with',
    'my', 'is', 'it', 'this', 'that', 'was', 'i', 'was', 'lost', 'found', 'near',
    'have', 'has', 'had', 'been', 'from', 'by', 'as', 'are',
}

# CLIP zero-shot label set for detected_objects.
_ITEM_LABELS = [
    'phone', 'tablet', 'wallet', 'purse', 'keys', 'watch', 'bag', 'backpack',
    'laptop', 'computer', 'earphones', 'headphones', 'id card', 'document',
    'jewellery', 'ring', 'clothing', 'water bottle', 'spectacles', 'glasses',
    'camera', 'book', 'pet', 'dog', 'cat',
]

# Approx RGB for the predefined palette (dominant-colour mapping).
_COLOR_RGB = {
    'Black': (20, 20, 20), 'White': (245, 245, 245), 'Silver': (192, 192, 192),
    'Grey': (128, 128, 128), 'Blue': (40, 80, 200), 'Red': (200, 40, 40),
    'Green': (40, 160, 60), 'Yellow': (230, 220, 50), 'Orange': (230, 140, 30),
    'Brown': (120, 75, 40), 'Pink': (230, 130, 170), 'Purple': (130, 60, 180),
    'Gold': (212, 175, 55),
}


def _normalized_title(title):
    t = (title or '').lower()
    t = re.sub(r'[^a-z0-9 ]', ' ', t)
    return re.sub(r'\s+', ' ', t).strip()


def _keywords(title, description):
    text = f'{title or ""} {description or ""}'.lower()
    tokens = re.findall(r'[a-z0-9]+', text)
    seen, out = set(), []
    for tok in tokens:
        if len(tok) >= 3 and tok not in _STOPWORDS and tok not in seen:
            seen.add(tok)
            out.append(tok)
    return out[:20]


def _description_embedding(description):
    if not description:
        return []
    try:
        from matching.views import get_sentence_model
        return get_sentence_model().encode(description).tolist()
    except Exception as exc:
        logger.warning("description_embedding skipped: %s", exc)
        return []


def _detected_objects(image_bytes):
    if not image_bytes:
        return []
    scored = clip_best_label(image_bytes, _ITEM_LABELS)
    return [{'label': lbl, 'score': round(s, 4)} for lbl, s in scored[:3]]


def _dominant_colors(image_bytes):
    if not image_bytes:
        return []
    try:
        import numpy as np
        from PIL import Image
        img = Image.open(io.BytesIO(image_bytes)).convert('RGB').resize((48, 48))
        arr = np.array(img).reshape(-1, 3).mean(axis=0)
        # nearest predefined colour by Euclidean RGB distance
        best = min(_COLOR_RGB.items(),
                   key=lambda kv: sum((a - b) ** 2 for a, b in zip(kv[1], arr)))
        return [best[0]]
    except Exception as exc:
        logger.warning("dominant_colors skipped: %s", exc)
        return []


def prepare_for_matching(item_data, image_bytes=None):
    """Return the extracted/normalized fields to save alongside the report."""
    title = item_data.get('title', '')
    description = item_data.get('description', '')
    return {
        'normalized_title': _normalized_title(title),
        'extracted_keywords': _keywords(title, description),
        'description_embedding': _description_embedding(description),
        'detected_objects': _detected_objects(image_bytes),
        'dominant_colors_detected': _dominant_colors(image_bytes),
        'image_hash': image_md5(image_bytes),
    }
