from .models import Notification


def notify(user, notification_type, title, message, reference_id=None):
    """Create a notification for a user. Safe to call from any app."""
    if user is None:
        return None
    return Notification.objects.create(
        user=user,
        notification_type=notification_type,
        title=title,
        message=message,
        reference_id=reference_id,
    )
