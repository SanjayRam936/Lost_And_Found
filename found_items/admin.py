from django.contrib import admin
from .models import FoundItems

class FoundItemsAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'category', 'location', 'date', 'created_at')
    search_fields = ('title', 'description', 'category', 'location')
    list_filter = ('category', 'date')

admin.site.register(FoundItems, FoundItemsAdmin)