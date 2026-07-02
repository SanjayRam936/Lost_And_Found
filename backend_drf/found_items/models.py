from django.db import models
from django.conf import settings
from django.utils import timezone

class FoundItems(models.Model):
    HANDOVER_CHOICES = [
        ('DIRECT', 'Direct'),
        ('POLICE', 'Police'),
        ('INSTITUTION', 'Institution'),
    ]

    user        = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='found_items', default=1)
    title       = models.CharField(max_length=255)
    description = models.TextField()
    category    = models.CharField(max_length=100, default='Unknown')
    brand       = models.CharField(max_length=100, blank=True, null=True)
    color       = models.CharField(max_length=100, blank=True, null=True)
    location    = models.CharField(max_length=255)         # human readable address
    latitude    = models.FloatField(blank=True, null=True) # for GPS matching
    longitude   = models.FloatField(blank=True, null=True) # for GPS matching
    date        = models.DateField()
    time        = models.TimeField()
    image       = models.ImageField(upload_to='found_items_images/', blank=True, null=True)
    handover_type = models.CharField(max_length=20, choices=HANDOVER_CHOICES, default='DIRECT')
    wants_reward  = models.BooleanField(default=False)
    # Where a POLICE / INSTITUTION item was dropped off (shown to the owner so
    # they can collect it). Coordinates power the map marker.
    handover_place = models.CharField(max_length=255, blank=True)
    handover_latitude = models.FloatField(blank=True, null=True)
    handover_longitude = models.FloatField(blank=True, null=True)
    created_at  = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.title} - {self.user}"
