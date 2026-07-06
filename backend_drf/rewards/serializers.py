from urllib.parse import quote
from rest_framework import serializers
from .models import Reward


def _display_name(user):
    if not user:
        return ''
    return (user.full_name or '').strip() or user.email


def build_upi_link(reward):
    """UPI intent deep link that pays the FINDER directly (their own UPI ID).
    Returns '' when the finder hasn't added a UPI ID yet."""
    finder = reward.claim.finder if reward.claim_id else None
    vpa = (getattr(finder, 'upi_id', '') or '').strip()
    if not vpa:
        return ''
    amount = reward.amount or 0
    name = _display_name(finder) or 'Finder'
    item = reward.claim.match.lost_item.title if reward.claim_id else 'item'
    return (
        f"upi://pay?pa={quote(vpa)}&pn={quote(name)}"
        f"&am={amount}&cu=INR&tn={quote(f'Reward for {item}')}"
    )


class RewardSummarySerializer(serializers.ModelSerializer):
    finder_name = serializers.SerializerMethodField()
    owner_name = serializers.SerializerMethodField()
    item_title = serializers.SerializerMethodField()
    role = serializers.SerializerMethodField()
    upi_link = serializers.SerializerMethodField()
    finder_upi_id = serializers.SerializerMethodField()

    class Meta:
        model = Reward
        fields = [
            'id', 'claim', 'amount', 'escrow_status', 'finder_name', 'owner_name',
            'item_title', 'role', 'upi_link', 'finder_upi_id', 'created_at',
        ]
        read_only_fields = ['escrow_status', 'finder_name', 'owner_name', 'item_title', 'role', 'upi_link', 'finder_upi_id']

    def get_finder_upi_id(self, obj):
        return (getattr(obj.claim.finder, 'upi_id', '') or '')

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
