from django.db import models
from django.conf import settings
from found_items.models import FoundItems
from lost_items.models import LostItems

class Claim(models.Model):
    HANDOVER_CHOICES = [
        ('DIRECT', 'Direct Contact'),
        ('POLICE', 'Police'),
        ('VENUE', 'Venue Management'),
    ]

    STATUS_CHOICES = [
        ('PENDING', 'Pending'),                     # Challenge phase
        ('CHALLENGE_PASSED', 'Challenge Passed'),   # OTP phase
        ('OTP_VERIFIED', 'OTP Verified'),           # Handover phase
        ('COMPLETED', 'Completed'),                 # Claim fully accepted/handover done
        ('REJECTED', 'Rejected'),                   # Claim rejected
    ]

    claimer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='claims')
    found_item = models.ForeignKey(FoundItems, on_delete=models.CASCADE, related_name='claims')
    lost_item = models.ForeignKey(LostItems, on_delete=models.SET_NULL, null=True, blank=True, related_name='claims')

    # Step 1: Challenge
    challenge_answer = models.TextField(blank=True, null=True)
    
    # Step 2: OTP Verification
    otp = models.CharField(max_length=6, blank=True, null=True)
    otp_verified = models.BooleanField(default=False)
    otp_sent_at = models.DateTimeField(blank=True, null=True)

    # Step 3: Handover
    handover_method = models.CharField(max_length=20, choices=HANDOVER_CHOICES, blank=True, null=True)

    # Claim State
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Claim by {self.claimer.username} for {self.found_item.title}"
