from rest_framework import serializers
from .models import Reward
from claims.models import Claim

class RewardSummarySerializer(serializers.ModelSerializer):
    finder_name = serializers.SerializerMethodField()
    item_title = serializers.SerializerMethodField()

    class Meta:
        model = Reward
        fields = ['id', 'claim', 'amount', 'escrow_status', 'finder_name', 'item_title', 'created_at']
        read_only_fields = ['escrow_status', 'finder_name', 'item_title']

    def get_finder_name(self, obj):
        # The finder is the user who originally posted the found_item
        user = obj.claim.found_item.user
        return user.first_name if user.first_name else user.username

    def get_item_title(self, obj):
        return obj.claim.found_item.title

class RewardAmountUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reward
        fields = ['amount']
