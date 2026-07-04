"""Detect a user re-submitting the same report.

A duplicate requires ALL of: same user, same category, title similarity ≥ 0.85
(sentence-transformers), location within 1 km, and date within 3 days — OR an
identical uploaded image (MD5 hash match). Same TYPE only (a lost + a found of
the same item are not duplicates of each other).
"""
import hashlib
import logging
import math
from datetime import timedelta

from .ai_utils import text_similarity

logger = logging.getLogger(__name__)

TITLE_SIM_MIN = 0.85
MAX_KM = 1.0
MAX_DAYS = 3


def image_md5(image_bytes):
    return hashlib.md5(image_bytes).hexdigest() if image_bytes else ''


def _km(lat1, lng1, lat2, lng2):
    if None in (lat1, lng1, lat2, lng2):
        return float('inf')
    R = 6371.0
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlmb = math.radians(lng2 - lng1)
    a = math.sin(dphi / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dlmb / 2) ** 2
    return R * 2 * math.asin(math.sqrt(a))


def find_duplicate(user, is_found, title, category, latitude, longitude, date, image_bytes=None):
    """Returns (errors: dict, warnings: list). Blocks with an error if a
    duplicate is found."""
    errors, warnings = {}, []
    if user is None:
        return errors, warnings

    from lost_items.models import LostItems
    from found_items.models import FoundItems

    Model = FoundItems if is_found else LostItems
    qs = Model.objects.filter(user=user, category=category)
    if not is_found:
        qs = qs.filter(status='ACTIVE')                # only open lost reports

    new_hash = image_md5(image_bytes)

    for other in qs.only('id', 'title', 'latitude', 'longitude', 'date', 'image_hash')[:100]:
        # 1) exact same image -> definite duplicate.
        if new_hash and getattr(other, 'image_hash', '') and other.image_hash == new_hash:
            errors['duplicate'] = 'You have already submitted a report with this exact photo.'
            return errors, warnings

        # 2) fuzzy: title + location + date must all match.
        sim = text_similarity(title, other.title)
        if sim is None or sim < TITLE_SIM_MIN:
            continue
        if _km(latitude, longitude, other.latitude, other.longitude) > MAX_KM:
            continue
        if date and other.date and abs((date - other.date).days) > MAX_DAYS:
            continue
        errors['duplicate'] = ('You have already submitted a similar report. '
                               'Please check your existing reports before submitting again.')
        return errors, warnings

    return errors, warnings
