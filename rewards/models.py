from django.db import models
from claims.models import Claim

class Reward(models.Model):
    ESCROW_STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('LOCKED', 'Locked'),
        ('AWAITING', 'Awaiting Confirmation'),
        ('RELEASED', 'Released'),
    ]

    claim = models.OneToOneField(Claim, on_delete=models.CASCADE, related_name='reward')
    amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    escrow_status = models.CharField(max_length=20, choices=ESCROW_STATUS_CHOICES, default='PENDING')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Reward for Claim {self.claim.id} - Status: {self.escrow_status}"
