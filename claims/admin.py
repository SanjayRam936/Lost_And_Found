from django.contrib import admin
from .models import Claim

class ClaimAdmin(admin.ModelAdmin):
    list_display = ('__str__', 'claimer', 'status', 'otp_verified', 'handover_method', 'created_at')
    list_filter = ('status', 'handover_method', 'otp_verified')
    search_fields = ('claimer__username', 'found_item__title', 'lost_item__title')

admin.site.register(Claim, ClaimAdmin)
