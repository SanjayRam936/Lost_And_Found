from rest_framework import serializers
from .models import Notification

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'
        # The user shouldn't be able to manually modify the title, message, etc via the API directly.
        read_only_fields = ['user', 'notification_type', 'title', 'message', 'reference_id', 'created_at']
