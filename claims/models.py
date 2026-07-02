from django.db import models
from matching.models import MatchItem


class Claim(models.Model):
    """
    A claim is tied to a single AI MatchItem. Per the Section 6 redesign, the
    AI match itself is the proof of ownership — there is no identity challenge.
    The OTP is a *handover confirmation* (LPG-cylinder style): the Owner holds
    the code and reads it aloud at the meetup; the Finder enters it to confirm.
    OTP does not expire.
    """

    HANDOVER_CHOICES = [
        ('DIRECT', 'Direct'),
        ('POLICE', 'Police'),
        ('INSTITUTION', 'Institution'),
    ]

    STATUS_CHOICES = [
        ('INITIATED', 'Initiated'),      # DIRECT: OTP generated, awaiting handover
        ('RESOLVED', 'Resolved'),        # DIRECT: OTP verified, handover done
        ('HANDED_OVER', 'Handed Over'),  # POLICE/INSTITUTION: no OTP, collect there
    ]

    match = models.OneToOneField(MatchItem, on_delete=models.CASCADE, related_name='claim')
    handover_type = models.CharField(max_length=20, choices=HANDOVER_CHOICES, default='DIRECT')

    otp_code = models.CharField(max_length=6, blank=True, null=True)
    otp_verified = models.BooleanField(default=False)
    otp_verified_at = models.DateTimeField(blank=True, null=True)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='INITIATED')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def owner(self):
        """The person who lost the item — holds and reveals the OTP."""
        return self.match.lost_item.user

    @property
    def finder(self):
        """The person who found the item — enters the OTP to confirm handover."""
        return self.match.found_item.user

    def is_participant(self, user):
        return user == self.owner or user == self.finder

    def __str__(self):
        return f"Claim #{self.id} for match {self.match_id} ({self.status})"
