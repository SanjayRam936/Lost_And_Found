from django.contrib import admin
from .models import MatchItem, VisibilityAccess

@admin.register(MatchItem)
class MatchItemAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'lost_item',
        'found_item',
        'confidence_score',
        'text_score',
        'image_similarity',
        'match_location',
        'time_score',
        'status',
        'matched_at',
    )
    list_filter = ('status',)
    search_fields = (
        'lost_item__title',
        'found_item__title',
        'lost_item__description',
        'found_item__description',
    )
    ordering = ('-confidence_score',)


@admin.register(VisibilityAccess)
class VisibilityAccessAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'match',
        'user',
        'granted_at',
    )
    list_filter = ('granted_at',)
    search_fields = (
        'match__lost_item__title',
        'match__found_item__title',
        'user__username',
        'user__email',
    )
    ordering = ('-granted_at',)


