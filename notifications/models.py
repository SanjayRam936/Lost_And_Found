from django.db import models
from django.conf import settings

class Notification(models.Model):
    NOTIFICATION_TYPES = [
        ('MATCH_FOUND', 'New Match Found'),
        ('CLAIM_UPDATE', 'Claim Update'),
        ('OTP_SENT', 'OTP Sent'),
        ('REWARD_RECEIVED', 'Reward Received'),
        ('ESCALATION_ALERT', 'Escalation Alert'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES)
    title = models.CharField(max_length=255)
    message = models.TextField()
    
    # Optional reference ID to the related entity (Claim, FoundItem, etc.) to build links on the frontend
    reference_id = models.IntegerField(blank=True, null=True) 
    
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.email} - {self.get_notification_type_display()} - Read: {self.is_read}"
