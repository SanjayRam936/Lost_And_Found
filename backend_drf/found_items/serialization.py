from rest_framework import serializers
from .models import FoundItems


class FoundItemsSerializer(serializers.ModelSerializer):
    # Finder-facing signals: did this found item match a lost report, and has
    # the owner started a claim (generated an OTP) on it?
    is_matched = serializers.SerializerMethodField()
    claim = serializers.SerializerMethodField()

    class Meta:
        model = FoundItems
        fields = '__all__'
        read_only_fields = ['user', 'created_at']

    def get_is_matched(self, obj):
        from matching.models import MatchItem
        return MatchItem.objects.filter(
            found_item=obj, status__in=['STRONG', 'REVIEW']
        ).exists()

    def get_claim(self, obj):
        from claims.models import Claim
        claim = Claim.objects.filter(match__found_item=obj).order_by('-created_at').first()
        if not claim:
            return None
        reward_status = None
        reward_amount = None
        if hasattr(claim, 'reward'):
            reward_status = claim.reward.escrow_status
            reward_amount = str(claim.reward.amount)
        return {
            'id': claim.id,
            'match_id': claim.match_id,
            'status': claim.status,
            'handover_type': claim.handover_type,
            'wants_reward': obj.wants_reward,
            'reward_status': reward_status,
            'reward_amount': reward_amount,
        }
