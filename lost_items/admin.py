from django.contrib import admin
from .models import LostItems

class LostItemsAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'category', 'location', 'status', 'created_at')
    search_fields = ('title', 'description', 'category', 'location')
    list_filter = ('status', 'category', 'date')

admin.site.register(LostItems, LostItemsAdmin)
