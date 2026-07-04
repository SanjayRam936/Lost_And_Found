"""FAIL-OPEN wrappers around the matching engine's AI models.

The validators reuse the SAME lazily-loaded singletons the matching engine uses
(matching.views), so we never load a second copy of MiniLM / CLIP into memory.
Every function returns ``None`` on any failure so callers can skip the AI check
instead of blocking a legitimate submission.
"""
import logging

logger = logging.getLogger(__name__)


def torch_available():
    try:
        from matching.views import _TORCH_OK
        return bool(_TORCH_OK)
    except Exception:
        return False


def text_similarity(a, b):
    """sentence-transformers cosine similarity in [0, 1] (or None on failure)."""
    if not a or not b:
        return None
    try:
        from matching.views import compute_semantic_score
        return float(compute_semantic_score(a, b))
    except Exception as exc:
        logger.warning("validation text_similarity failed: %s", exc)
        return None


def clip_image_text_similarity(image_bytes, text):
    """Raw CLIP cosine similarity between an image and a text label (or None).

    NOTE: raw CLIP cosines are low-scale (~0.15–0.35 for a genuine match), which
    is why the spec's image thresholds (0.15 / 0.20) look small — that's correct
    for un-rescaled cosine values.
    """
    if not image_bytes or not text:
        return None
    try:
        import torch.nn.functional as F
        from matching.views import _clip_image_features, _clip_text_features
        img = _clip_image_features(image_bytes)
        txt = _clip_text_features(text)
        return float(F.cosine_similarity(img, txt))
    except Exception as exc:
        logger.warning("validation clip_image_text_similarity failed: %s", exc)
        return None


def clip_best_label(image_bytes, labels):
    """Zero-shot: return [(label, cosine), ...] sorted best-first (or [])."""
    if not image_bytes or not labels:
        return []
    try:
        import torch.nn.functional as F
        from matching.views import _clip_image_features, _clip_text_features
        img = _clip_image_features(image_bytes)
        scored = []
        for label in labels:
            txt = _clip_text_features(label)
            scored.append((label, float(F.cosine_similarity(img, txt))))
        scored.sort(key=lambda x: x[1], reverse=True)
        return scored
    except Exception as exc:
        logger.warning("validation clip_best_label failed: %s", exc)
        return []
