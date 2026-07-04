"""GPS + route validation.

Hard checks: coordinate ranges, the (0,0) "null island", and route sanity
(source ≠ destination, distance ≤ 2000 km). The Nominatim reverse-geocode is
BEST-EFFORT: if it resolves an address we return it, but a network failure does
NOT block the submission (the frontend already sends a resolved address).
"""
import logging
import math

logger = logging.getLogger(__name__)

MAX_ROUTE_KM = 2000.0


def _haversine_km(lat1, lng1, lat2, lng2):
    R = 6371.0
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlmb = math.radians(lng2 - lng1)
    a = math.sin(dphi / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dlmb / 2) ** 2
    return R * 2 * math.asin(math.sqrt(a))


def _valid_point(lat, lng):
    if lat is None or lng is None:
        return False
    if not (-90 <= lat <= 90) or not (-180 <= lng <= 180):
        return False
    if lat == 0 and lng == 0:                          # null island
        return False
    return True


def reverse_geocode(lat, lng):
    """Best-effort readable address from Nominatim, or None."""
    try:
        import requests
        r = requests.get(
            'https://nominatim.openstreetmap.org/reverse',
            params={'lat': lat, 'lon': lng, 'format': 'json'},
            headers={'User-Agent': 'lost-and-found-ai/1.0'},
            timeout=6,
        )
        data = r.json()
        return data.get('display_name') or None
    except Exception as exc:
        logger.warning("reverse geocode skipped: %s", exc)
        return None


def validate_location(location_type, latitude, longitude,
                      source_latitude=None, source_longitude=None,
                      dest_latitude=None, dest_longitude=None):
    """Returns (errors: dict, warnings: list, resolved_address: str|None)."""
    errors, warnings = {}, []
    resolved = None

    if location_type == 'ROUTE':
        if not _valid_point(source_latitude, source_longitude) or \
           not _valid_point(dest_latitude, dest_longitude):
            errors['location'] = 'Please provide valid source and destination GPS locations.'
            return errors, warnings, resolved
        if source_latitude == dest_latitude and source_longitude == dest_longitude:
            errors['location'] = 'Source and destination cannot be the same place.'
            return errors, warnings, resolved
        if _haversine_km(source_latitude, source_longitude, dest_latitude, dest_longitude) > MAX_ROUTE_KM:
            errors['location'] = 'This route is too long. Please pick a more specific route.'
            return errors, warnings, resolved
        return errors, warnings, resolved

    # EXACT
    if not _valid_point(latitude, longitude):
        errors['location'] = 'Please provide a valid GPS location.'
        return errors, warnings, resolved

    resolved = reverse_geocode(latitude, longitude)    # best-effort; may be None
    return errors, warnings, resolved
