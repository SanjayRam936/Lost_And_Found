from rest_framework import serializers
from .models import Claim


class ClaimSerializer(serializers.ModelSerializer):
    # Vivar Adar: only the Owner ever sees the OTP code; the Finder gets null.
    otp_code = serializers.SerializerMethodField()
    role = serializers.SerializerMethodField()
    wants_reward = serializers.SerializerMethodField()

    class Meta:
        model = Claim
        fields = [
            'id', 'match', 'handover_type', 'otp_code', 'otp_verified',
            'otp_verified_at', 'status', 'role', 'wants_reward', 'created_at',
        ]

    def _user(self):
        request = self.context.get('request')
        return getattr(request, 'user', None)

    def get_otp_code(self, obj):
        return obj.otp_code if self._user() == obj.owner else None

    def get_role(self, obj):
        user = self._user()
        if user == obj.owner:
            return 'owner'
        if user == obj.finder:
            return 'finder'
        return None

    def get_wants_reward(self, obj):
        return obj.match.found_item.wants_reward


class OTPVerifySerializer(serializers.Serializer):
    otp = serializers.CharField(max_length=6, min_length=6)
