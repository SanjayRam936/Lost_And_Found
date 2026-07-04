"""AI cross-field consistency — run AFTER the per-field checks pass.

All model-backed consistency logic is centralised here (not scattered across
serializers). Every check is FAIL-OPEN: if a model returns None (error /
unavailable) the check is skipped.

Reject vs. warn (chosen to limit false rejections of genuine users):
  HARD ERROR:  title↔category, image↔title, image↔category
  WARNING:     title↔description, image↔description, colour↔image
To make the AI checks non-blocking everywhere, move the error lines below into
`warnings` — the engine surfaces warnings without blocking the submission.
"""
import logging

from .ai_utils import text_similarity, clip_image_text_similarity, clip_best_label
from .constants import COLORS

logger = logging.getLogger(__name__)

# Thresholds (raw cosine). Text = sentence-transformers [0,1]; image = CLIP cosine.
TITLE_CATEGORY_MIN = 0.25
TITLE_DESC_MIN     = 0.20
IMG_TITLE_MIN      = 0.15
IMG_CATEGORY_MIN   = 0.20
IMG_DESC_MIN       = 0.15


def validate_cross_fields(title, category, description, colors, image_bytes=None):
    """Returns (errors: dict, warnings: list). `colors` is a list of colour names."""
    errors, warnings = {}, []

    # ── Text ↔ Text (sentence-transformers) ──────────────────────
    if title and category:
        sim = text_similarity(title, category)
        if sim is not None and sim < TITLE_CATEGORY_MIN:
            errors['title'] = 'Your item title does not match the selected category.'

    if title and description and 'title' not in errors:
        sim = text_similarity(title, description)
        if sim is not None and sim < TITLE_DESC_MIN:
            warnings.append('Your description does not seem related to the item title.')

    # ── Image ↔ Text (CLIP) ──────────────────────────────────────
    if image_bytes:
        if title:
            sim = clip_image_text_similarity(image_bytes, title)
            if sim is not None and sim < IMG_TITLE_MIN:
                errors['image'] = 'The uploaded image does not appear to match the reported item.'

        if category and 'image' not in errors:
            sim = clip_image_text_similarity(image_bytes, f'a photo of {category}')
            if sim is not None and sim < IMG_CATEGORY_MIN:
                errors['image'] = 'The uploaded image does not appear to match the selected category.'

        if description and 'image' not in errors:
            sim = clip_image_text_similarity(image_bytes, description[:200])
            if sim is not None and sim < IMG_DESC_MIN:
                warnings.append('The uploaded image may not match the description.')

        # ── Colour ↔ Image (CLIP zero-shot over the colour palette) ──
        if colors:
            scored = clip_best_label(image_bytes, [f'a {c.lower()} coloured object' for c in COLORS])
            if scored:
                top = {lbl for lbl, _ in scored[:3]}
                selected_labels = {f'a {c.lower()} coloured object' for c in colors}
                if selected_labels and not (selected_labels & top):
                    warnings.append('The color you selected does not appear to match the image.')

    return errors, warnings
