from django.contrib import admin
from .models import MatchItem, VisibilityAccess

class MatchItemAdmin(admin.ModelAdmin):
    list_display = ('__str__', 'status', 'confidence_score', 'matched_at')
    list_filter = ('status',)
    search_fields = ('lost_item__title', 'found_item__title')

class VisibilityAccessAdmin(admin.ModelAdmin):
    list_display = ('match', 'user', 'granted_at')

admin.site.register(MatchItem, MatchItemAdmin)
admin.site.register(VisibilityAccess, VisibilityAccessAdmin)
