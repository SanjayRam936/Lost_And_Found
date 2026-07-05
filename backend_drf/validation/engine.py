"""The single shared validation engine used by BOTH the lost and found flows.

serializer.validate() -> run_report_validation(...) which:
  1. rate-limits (429 on abuse)
  2. runs every per-field check (text, category/colour membership, location,
     date/time, unique-ids, photo)
  3. runs the AI cross-field consistency checks
  4. runs duplicate detection
  5. raises a field-specific ValidationError if anything blocks
  6. otherwise returns the ai_prep extracted fields + resolved address + warnings

`is_found` toggles the only behavioural difference: photo optional vs mandatory.
"""
import io
import logging
import re

from rest_framework import serializers
from rest_framework.exceptions import Throttled

from . import text_validator, image_validator, location_validator, \
    cross_field_validator, duplicate_detector, spam_protector, ai_prep
from .constants import CATEGORIES, COLORS

logger = logging.getLogger(__name__)


def _read_bytes(image_file):
    if not image_file:
        return None
    try:
        image_file.seek(0)
        data = image_file.read()
        image_file.seek(0)
        return data or None
    except Exception:
        return None


def _validate_dates(date, time):
    # NOTE: we deliberately do NOT reject "future" times. The client sends a
    # naive HH:MM with no timezone, while the server runs in UTC — comparing the
    # two wrongly flags valid local times (e.g. IST is +5:30 ahead of UTC) as
    # being in the future. The date check below is unambiguous and enough.
    import calendar
    import datetime
    from django.utils import timezone
    errors = {}
    if date:
        # localdate() now returns the IST date (TIME_ZONE=Asia/Kolkata), so it
        # matches the user's own "today" — no timezone grace needed.
        today = timezone.localdate()
        # Earliest allowed date: 6 calendar months before today.
        month = today.month - 6
        year = today.year
        if month <= 0:
            month += 12
            year -= 1
        day = min(today.day, calendar.monthrange(year, month)[1])
        earliest = datetime.date(year, month, day)
        if date > today:
            errors['date'] = 'Future dates are not allowed.'
        elif date < earliest:
            errors['date'] = 'The date must be within the last 6 months.'
    return errors


def _validate_unique_ids(data):
    errors = {}
    imei = (data.get('imei_number') or '').strip()
    serial = (data.get('serial_number') or '').strip()
    model = (data.get('model_number') or '').strip()
    reg = (data.get('reg_number') or '').strip()

    if imei and not re.fullmatch(r'\d{15}', imei):
        errors['imei_number'] = 'IMEI number must be exactly 15 digits.'
    if serial and not re.fullmatch(r'[A-Za-z0-9]{4,30}', serial):
        errors['serial_number'] = 'Serial number must be 4–30 letters/numbers.'
    if model and not re.fullmatch(r'[A-Za-z0-9 \-]{1,50}', model):
        errors['model_number'] = 'Model number may contain letters, numbers, spaces and hyphens (max 50).'
    if reg and not re.fullmatch(r'[A-Za-z0-9]{1,20}', reg):
        errors['reg_number'] = 'Registration number must be up to 20 letters/numbers.'
    return errors


def run_report_validation(data, image_file, user, request, is_found):
    """Public entry point. Real validation failures (ValidationError) and rate
    limits (Throttled) propagate; any UNEXPECTED error is logged and swallowed so
    a validation bug can never 500 a submission — the report just saves without
    the extra fields."""
    try:
        return _run_report_validation(data, image_file, user, request, is_found)
    except (serializers.ValidationError, Throttled):
        raise
    except Exception as exc:
        logger.exception("Validation engine crashed — allowing submit: %s", exc)
        return {'extracted': {}, 'resolved_location': None, 'warnings': []}


def _run_report_validation(data, image_file, user, request, is_found):
    # 0) Rate limiting first (cheap; raises 429 before any heavy work).
    spam_protector.check_limits(user, request)

    image_bytes = _read_bytes(image_file)
    title = (data.get('title') or '').strip()
    category = data.get('category')
    description = data.get('description') or ''
    color = data.get('color')
    warnings = []
    errors = {}

    # 1) Deterministic per-field checks.
    for validator, args in (
        (text_validator.validate_title, (title,)),
        (text_validator.validate_description, (description,)),
        (text_validator.validate_brand, (data.get('brand'), category)),
    ):
        e, w = validator(*args)
        errors.update(e)
        warnings.extend(w)

    if category not in CATEGORIES:
        errors['category'] = 'Please select a valid category from the list.'
    if color and color not in COLORS:
        errors['color'] = 'Please select a color from the available options.'

    e, w, resolved = location_validator.validate_location(
        data.get('location_type', 'EXACT'),
        data.get('latitude'), data.get('longitude'),
        data.get('source_latitude'), data.get('source_longitude'),
        data.get('dest_latitude'), data.get('dest_longitude'),
    )
    errors.update(e); warnings.extend(w)

    errors.update(_validate_dates(data.get('date'), data.get('time')))
    errors.update(_validate_unique_ids(data))

    e, w = image_validator.validate_image(image_bytes, is_found, title)
    errors.update(e); warnings.extend(w)

    # 2) AI cross-field consistency — only if the per-field checks passed.
    if not errors:
        e, w = cross_field_validator.validate_cross_fields(
            title, category, description,
            [color] if color else [], image_bytes,
        )
        errors.update(e); warnings.extend(w)

    # 3) Duplicate detection — only if still clean.
    if not errors:
        e, w = duplicate_detector.find_duplicate(
            user, is_found, title, category,
            data.get('latitude'), data.get('longitude'), data.get('date'), image_bytes,
        )
        errors.update(e); warnings.extend(w)

    if errors:
        raise serializers.ValidationError(errors)

    # 4) All good — normalize & extract for the matching engine.
    extracted = ai_prep.prepare_for_matching(
        {'title': title, 'description': description}, image_bytes)

    return {
        'extracted': extracted,
        'resolved_location': resolved,
        'warnings': warnings,
    }
