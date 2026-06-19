from rest_framework import serializers
from .models import Claim

class ClaimSerializer(serializers.ModelSerializer):
    class Meta:
        model = Claim
        fields = '__all__'
        read_only_fields = ['status', 'otp', 'otp_verified', 'otp_sent_at']

class ChallengeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Claim
        fields = ['challenge_answer']

class OTPVerifySerializer(serializers.Serializer):
    otp = serializers.CharField(max_length=6)

class HandoverSerializer(serializers.ModelSerializer):
    class Meta:
        model = Claim
        fields = ['handover_method']
