from django.db import models
from django.conf import settings

class LostItems(models.Model):
    STATUS_CHOICES = [
        ('ACTIVE',   'Active'),
        ('MATCHED',  'Matched'),
        ('RESOLVED', 'Resolved'),
    ]

    user           = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='lost_items')
    title          = models.CharField(max_length=255)
    description    = models.TextField()
    category       = models.CharField(max_length=100)
    brand          = models.CharField(max_length=100, blank=True, null=True)
    color          = models.CharField(max_length=100, blank=True, null=True)
    location       = models.CharField(max_length=255)
    latitude       = models.FloatField(blank=True, null=True)
    longitude      = models.FloatField(blank=True, null=True)
    date           = models.DateField()
    time           = models.TimeField()
    image          = models.ImageField(upload_to='lost_items_images/', blank=True, null=True)
    hidden_details = models.TextField()
    status         = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ACTIVE')
    created_at     = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} - {self.user}"


    
