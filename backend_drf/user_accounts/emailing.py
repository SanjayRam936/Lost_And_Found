import logging

from django.conf import settings
from django.core.mail import send_mail

logger = logging.getLogger(__name__)


def send_otp_email(user):
    """Email the user's current 6-digit verification code. Raises on failure so
    the caller can surface a friendly error."""
    code = user.email_otp
    subject = 'Your Lost & Found verification code'
    message = (
        f"Hi {user.full_name or 'there'},\n\n"
        f"Your Lost & Found verification code is:\n\n"
        f"    {code}\n\n"
        f"Enter this code in the app to finish creating your account. "
        f"It expires in 10 minutes.\n\n"
        f"If you didn't request this, you can safely ignore this email.\n\n"
        f"— The Lost & Found team"
    )
    from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', None)
    send_mail(subject, message, from_email, [user.email], fail_silently=False)
    logger.info('Sent verification code to %s', user.email)
