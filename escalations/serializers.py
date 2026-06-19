from rest_framework import serializers
from .models import EscalationReport

class EscalationReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = EscalationReport
        fields = '__all__'
