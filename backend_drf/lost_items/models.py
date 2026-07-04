from django.db import models
from django.conf import settings
from django.utils import timezone

class LostItems(models.Model):
    STATUS_CHOICES = [
        ('ACTIVE',   'Active'),
        ('MATCHED',  'Matched'),
        ('RESOLVED', 'Resolved'),
    ]

    user           = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='lost_items', default=1)
    title          = models.CharField(max_length=255)
    description    = models.TextField()
    category       = models.CharField(max_length=100, default='Unknown')
    brand          = models.CharField(max_length=100, blank=True, null=True)
    color          = models.CharField(max_length=100, blank=True, null=True)
    location       = models.CharField(max_length=255)
    latitude       = models.FloatField(blank=True, null=True)
    longitude      = models.FloatField(blank=True, null=True)

    # ── Location mode (Feature 1) ────────────────────────────────
    # EXACT: a single pinned point (latitude/longitude above).
    # ROUTE: lost somewhere along a travel corridor (source -> destination).
    LOCATION_TYPE_CHOICES = [('EXACT', 'Exact'), ('ROUTE', 'Route')]
    location_type    = models.CharField(max_length=10, choices=LOCATION_TYPE_CHOICES, default='EXACT')
    source_location  = models.CharField(max_length=255, blank=True, null=True)
    source_latitude  = models.FloatField(blank=True, null=True)
    source_longitude = models.FloatField(blank=True, null=True)
    dest_location    = models.CharField(max_length=255, blank=True, null=True)
    dest_latitude    = models.FloatField(blank=True, null=True)
    dest_longitude   = models.FloatField(blank=True, null=True)

    date           = models.DateField(blank=True, null=True)
    time           = models.TimeField(blank=True, null=True)
    image          = models.ImageField(upload_to='lost_items_images/', blank=True, null=True)
    status         = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ACTIVE')
    created_at     = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.title} - {self.user}"


    
