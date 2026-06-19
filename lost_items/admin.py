from django.contrib import admin
from .models import LostItems

# Register your models here.
@admin.register(LostItems)
class LostItemsAdmin(admin.ModelAdmin):
    list_display = ('title', 'location', 'date', 'time')
    list_filter = ('location', 'date')
    search_fields = ('title', 'description')
    ordering = ('-date',)
