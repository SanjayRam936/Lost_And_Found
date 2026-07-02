from django.contrib import admin
from .models import Reward

class RewardAdmin(admin.ModelAdmin):
    list_display = ('__str__', 'amount', 'escrow_status', 'created_at')
    list_filter = ('escrow_status',)
    search_fields = ('claim__id', 'claim__found_item__title')

admin.site.register(Reward, RewardAdmin)
