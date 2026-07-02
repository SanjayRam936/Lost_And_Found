from rest_framework import serializers
from .models import ChatMessage


class ChatMessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.SerializerMethodField()
    is_mine = serializers.SerializerMethodField()

    class Meta:
        model = ChatMessage
        fields = ['id', 'match', 'sender', 'sender_name', 'is_mine', 'message', 'timestamp']
        read_only_fields = ['match', 'sender', 'timestamp']

    def get_sender_name(self, obj):
        return (obj.sender.full_name or '').strip() or obj.sender.email

    def get_is_mine(self, obj):
        request = self.context.get('request')
        return bool(request and obj.sender_id == request.user.id)
