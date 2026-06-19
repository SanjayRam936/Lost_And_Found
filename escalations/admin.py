from django.contrib import admin
from .models import EscalationReport

class EscalationReportAdmin(admin.ModelAdmin):
    list_display = ('__str__', 'description', 'generated_at')
    search_fields = ('description',)

admin.site.register(EscalationReport, EscalationReportAdmin)
