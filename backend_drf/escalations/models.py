from django.db import models

class EscalationReport(models.Model):
    generated_at = models.DateTimeField(auto_now_add=True)
    pdf_file = models.FileField(upload_to='escalation_reports/', blank=True, null=True)
    description = models.CharField(max_length=255, default='Scheduled Escalation Report')

    def __str__(self):
        return f"Escalation Report - {self.generated_at.strftime('%Y-%m-%d %H:%M')}"
