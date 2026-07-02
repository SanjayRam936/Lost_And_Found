from django.db import models
from django.conf import settings
from matching.models import MatchItem


class ChatMessage(models.Model):
    """A message in the per-match chat thread (one thread per MatchItem)."""

    match = models.ForeignKey(MatchItem, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='chat_messages')
    message = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['timestamp']

    def __str__(self):
        return f"msg by {self.sender_id} on match {self.match_id}"
