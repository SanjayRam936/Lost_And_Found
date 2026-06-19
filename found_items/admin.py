from django.contrib import admin
from .models import FoundItems

# Register your models here.

@admin.register(FoundItems)
class FoundItemsAdmin(admin.ModelAdmin):
    list_display = ('title', 'location', 'date', 'time')
    list_filter = ('location', 'date')
    search_fields = ('title', 'description')
    ordering = ('-date',)