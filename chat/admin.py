from django.contrib import admin
from .models import ChatMessage


@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ('id', 'match', 'sender', 'message', 'timestamp')
    search_fields = ('message', 'sender__email')
    list_filter = ('timestamp',)
