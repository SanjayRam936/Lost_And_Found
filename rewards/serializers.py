from rest_framework import serializers
from django.conf import settings
from .models import Reward


def _display_name(user):
    if not user:
        return ''
    return (user.full_name or '').strip() or user.email


def build_upi_link(reward):
    """Razorpay-style UPI intent deep link (mock payee for the demo)."""
    amount = reward.amount or 0
    item = reward.claim.match.lost_item.title if reward.claim_id else 'item'
    note = f"Reward for {item}".replace(' ', '%20')
    return (
        f"upi://pay?pa=lostfound@upi&pn=LostFound.ai"
        f"&am={amount}&cu=INR&tn={note}"
    )


class RewardSummarySerializer(serializers.ModelSerializer):
    finder_name = serializers.SerializerMethodField()
    owner_name = serializers.SerializerMethodField()
    item_title = serializers.SerializerMethodField()
    role = serializers.SerializerMethodField()
    upi_link = serializers.SerializerMethodField()
    razorpay_enabled = serializers.SerializerMethodField()

    class Meta:
        model = Reward
        fields = [
            'id', 'claim', 'amount', 'escrow_status', 'finder_name', 'owner_name',
            'item_title', 'role', 'upi_link', 'razorpay_enabled', 'created_at',
        ]
        read_only_fields = ['escrow_status', 'finder_name', 'owner_name', 'item_title', 'role', 'upi_link', 'razorpay_enabled']

    def get_razorpay_enabled(self, obj):
        return bool(settings.RAZORPAY_KEY_ID and settings.RAZORPAY_KEY_SECRET)

    def _user(self):
        request = self.context.get('request')
        return getattr(request, 'user', None)

    def get_finder_name(self, obj):
        return _display_name(obj.claim.finder)

    def get_owner_name(self, obj):
        return _display_name(obj.claim.owner)

    def get_item_title(self, obj):
        return obj.claim.match.lost_item.title

    def get_role(self, obj):
        user = self._user()
        if user == obj.claim.owner:
            return 'owner'
        if user == obj.claim.finder:
            return 'finder'
        return None

    def get_upi_link(self, obj):
        return build_upi_link(obj)


class RewardAmountUpdateSerializer(serializers.ModelSerializer):
    amount = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=1)

    class Meta:
        model = Reward
        fields = ['amount']
