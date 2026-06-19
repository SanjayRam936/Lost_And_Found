from django.db import models
from django.conf import settings

class MatchItem(models.Model):

    STATUS_CHOICES = [
        ('PENDING',   'Pending'),
        ('STRONG',    'Strong Match'),    # confidence > 0.85
        ('REVIEW',    'Needs Review'),    # confidence 0.75 - 0.85
        ('DISMISSED', 'Dismissed'),       # user said "not my item"
        ('RESOLVED',  'Resolved'),        # claim completed
    ]

    lost_item        = models.ForeignKey('lost_items.LostItems',   on_delete=models.CASCADE, related_name='matches')
    found_item       = models.ForeignKey('found_items.FoundItems', on_delete=models.CASCADE, related_name='matches')
    confidence_score = models.FloatField()
    text_score       = models.FloatField()
    image_similarity = models.FloatField()
    match_location   = models.FloatField()
    time_score       = models.FloatField()
    status           = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    matched_at       = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-confidence_score']  # highest score first

    def __str__(self):
        return f"Match {self.lost_item} <-> {self.found_item} ({self.confidence_score})"


class VisibilityAccess(models.Model):

    match      = models.ForeignKey(MatchItem, on_delete=models.CASCADE, related_name='visibility')
    user       = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='visible_matches')
    granted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('match', 'user')  # one access record per user per match

    def __str__(self):
        return f"Access → {self.user} for Match {self.match.id}"