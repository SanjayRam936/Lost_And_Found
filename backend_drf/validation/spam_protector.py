"""Rate limiting / spam protection using Django's default cache (no Redis).

Limits:
  * ≤ 5 reports per user per day (lost + found combined)
  * ≥ 2 minutes cooldown between a user's consecutive submissions
  * ≤ 3 reports per IP address per hour

check_limits() raises DRF's Throttled (HTTP 429) when a limit is hit.
record_submission() is called AFTER a successful save to update the counters.
"""
import logging

from django.core.cache import cache
from django.utils import timezone
from rest_framework.exceptions import Throttled

logger = logging.getLogger(__name__)

MAX_PER_DAY = 5
COOLDOWN_SECONDS = 120
MAX_PER_IP_PER_HOUR = 3


def _client_ip(request):
    if not request:
        return None
    xff = request.META.get('HTTP_X_FORWARDED_FOR')
    if xff:
        return xff.split(',')[0].strip()
    return request.META.get('REMOTE_ADDR')


def _keys(user, ip):
    now = timezone.now()
    day = now.strftime('%Y%m%d')
    hour = now.strftime('%Y%m%d%H')
    uid = getattr(user, 'id', 'anon')
    return {
        'daily': f'spam:daily:{uid}:{day}',
        'last':  f'spam:last:{uid}',
        'ip':    f'spam:ip:{ip}:{hour}' if ip else None,
    }


def check_limits(user, request):
    """Raise Throttled (429) if any limit is exceeded. FAIL-OPEN on cache error."""
    try:
        ip = _client_ip(request)
        k = _keys(user, ip)

        if (cache.get(k['daily']) or 0) >= MAX_PER_DAY:
            raise Throttled(detail='You have reached the daily report limit. Please try again tomorrow.')

        last = cache.get(k['last'])
        if last is not None:
            elapsed = (timezone.now() - last).total_seconds()
            if elapsed < COOLDOWN_SECONDS:
                raise Throttled(detail='Please wait before submitting another report.')

        if k['ip'] and (cache.get(k['ip']) or 0) >= MAX_PER_IP_PER_HOUR:
            raise Throttled(detail='Too many reports from this network. Please try again later.')
    except Throttled:
        raise
    except Exception as exc:                            # cache backend hiccup -> allow
        logger.warning("spam check skipped: %s", exc)


def record_submission(user, request):
    """Update the counters after a successful save. FAIL-OPEN."""
    try:
        ip = _client_ip(request)
        k = _keys(user, ip)

        cache.set(k['daily'], (cache.get(k['daily']) or 0) + 1, 60 * 60 * 24)
        cache.set(k['last'], timezone.now(), COOLDOWN_SECONDS)
        if k['ip']:
            cache.set(k['ip'], (cache.get(k['ip']) or 0) + 1, 60 * 60)
    except Exception as exc:
        logger.warning("spam record skipped: %s", exc)
