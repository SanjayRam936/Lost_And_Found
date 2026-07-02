from django.contrib import admin
from .models import Claim


@admin.register(Claim)
class ClaimAdmin(admin.ModelAdmin):
    list_display = ('id', 'match', 'handover_type', 'status', 'otp_verified', 'created_at')
    list_filter = ('status', 'handover_type', 'otp_verified')
    search_fields = ('match__lost_item__title', 'match__found_item__title')
