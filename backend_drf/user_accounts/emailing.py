import logging

from django.conf import settings
from django.core.mail import send_mail

logger = logging.getLogger(__name__)

BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email'


def _otp_body(user):
    return (
        f"Hi {user.full_name or 'there'},\n\n"
        f"Your Lost & Found verification code is:\n\n"
        f"    {user.email_otp}\n\n"
        f"Enter this code in the app to finish creating your account. "
        f"It expires in 10 minutes.\n\n"
        f"If you didn't request this, you can safely ignore this email.\n\n"
        f"— The Lost & Found team"
    )


def _sender():
    """Return (name, email) from DEFAULT_FROM_EMAIL, supporting the
    'Display Name <addr@x>' format."""
    raw = getattr(settings, 'DEFAULT_FROM_EMAIL', '') or getattr(settings, 'EMAIL_HOST_USER', '')
    name, email = 'Lost & Found', raw
    if '<' in raw and '>' in raw:
        name = raw.split('<', 1)[0].strip() or name
        email = raw.split('<', 1)[1].split('>', 1)[0].strip()
    return name, email


def _send_via_brevo(user, api_key):
    """Send over Brevo's HTTPS API — works on hosts that block outbound SMTP
    (e.g. Hugging Face Spaces)."""
    import requests

    name, email = _sender()
    payload = {
        'sender': {'name': name, 'email': email},
        'to': [{'email': user.email}],
        'subject': 'Your Lost & Found verification code',
        'textContent': _otp_body(user),
    }
    resp = requests.post(
        BREVO_API_URL,
        json=payload,
        headers={'api-key': api_key, 'Content-Type': 'application/json', 'Accept': 'application/json'},
        timeout=15,
    )
    if resp.status_code >= 300:
        raise RuntimeError(f'Brevo API error {resp.status_code}: {resp.text[:300]}')


def send_otp_email(user):
    """Email the user's current 6-digit verification code. Prefers the Brevo
    HTTPS API when BREVO_API_KEY is set; otherwise falls back to Django's email
    backend (SMTP in prod, console in local dev). Raises on failure."""
    api_key = getattr(settings, 'BREVO_API_KEY', '')
    if api_key:
        _send_via_brevo(user, api_key)
        logger.info('Sent verification code to %s via Brevo', user.email)
        return

    from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', None)
    send_mail(
        'Your Lost & Found verification code',
        _otp_body(user),
        from_email,
        [user.email],
        fail_silently=False,
    )
    logger.info('Sent verification code to %s via SMTP/console', user.email)
