"""Photo validation: presence (mandatory for found), format, size, resolution,
corruption, blur (OpenCV Laplacian variance) and AI content match (CLIP).

All AI / OpenCV checks are FAIL-OPEN — a model or library failure skips that
check rather than blocking the submission.
"""
import io
import logging

from .ai_utils import clip_image_text_similarity

logger = logging.getLogger(__name__)

MAX_BYTES = 5 * 1024 * 1024        # 5 MB
MIN_DIMENSION = 100                # px
ALLOWED_FORMATS = {'JPEG', 'PNG', 'WEBP'}
BLUR_VARIANCE_MIN = 50.0           # Laplacian variance threshold
CLIP_IMAGE_TITLE_MIN = 0.15        # raw CLIP cosine


def validate_image(image_bytes, is_found, title=None):
    """Returns (errors: dict, warnings: list).

    image_bytes: raw file bytes, or None if no photo was uploaded.
    is_found:    True -> photo is mandatory.
    """
    errors, warnings = {}, []

    # 1) Presence — mandatory for found reports, optional for lost.
    if not image_bytes:
        if is_found:
            errors['image'] = 'A photo is required for found items.'
        return errors, warnings

    # 2) Size.
    if len(image_bytes) > MAX_BYTES:
        errors['image'] = 'Image file size must not exceed 5MB.'
        return errors, warnings

    # 3) Open with Pillow (rejects corrupt / unreadable files) + format + resolution.
    try:
        from PIL import Image
        img = Image.open(io.BytesIO(image_bytes))
        img.verify()                                   # detects corruption
        img = Image.open(io.BytesIO(image_bytes))      # re-open (verify() consumes it)
        fmt = (img.format or '').upper()
        width, height = img.size
    except Exception:
        errors['image'] = 'The uploaded image is corrupted or unreadable. Please upload a valid photo.'
        return errors, warnings

    if fmt not in ALLOWED_FORMATS:
        errors['image'] = 'Unsupported image format. Please use JPG, PNG, or WEBP.'
        return errors, warnings
    if width < MIN_DIMENSION or height < MIN_DIMENSION:
        errors['image'] = f'Image must be at least {MIN_DIMENSION}x{MIN_DIMENSION} pixels.'
        return errors, warnings

    # 4) Blur detection (OpenCV Laplacian variance) — FAIL-OPEN.
    try:
        import cv2
        import numpy as np
        rgb = np.array(img.convert('RGB'))
        gray = cv2.cvtColor(rgb, cv2.COLOR_RGB2GRAY)
        variance = cv2.Laplacian(gray, cv2.CV_64F).var()
        if variance < BLUR_VARIANCE_MIN:
            errors['image'] = 'The image is too blurry. Please upload a clearer photo.'
            return errors, warnings
    except Exception as exc:
        logger.warning("blur detection skipped: %s", exc)

    # 5) AI content match (CLIP image ↔ title) — FAIL-OPEN.
    if title:
        sim = clip_image_text_similarity(image_bytes, title)
        if sim is not None and sim < CLIP_IMAGE_TITLE_MIN:
            errors['image'] = 'The uploaded image does not appear to match the reported item.'
            return errors, warnings

    return errors, warnings
