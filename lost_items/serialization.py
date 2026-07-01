from rest_framework import serializers
from .models import LostItems


class LostItemsSerializer(serializers.ModelSerializer):
    # Owner-facing claim/reward state so the product list can route to the
    # reward page after a handover.
    claim = serializers.SerializerMethodField()

    class Meta:
        model = LostItems
        fields = '__all__'
        read_only_fields = ['user', 'status', 'created_at']

    def get_claim(self, obj):
        from claims.models import Claim
        claim = Claim.objects.filter(match__lost_item=obj).order_by('-created_at').first()
        if not claim:
            return None
        reward_status = None
        if hasattr(claim, 'reward'):
            reward_status = claim.reward.escrow_status
        return {
            'id': claim.id,
            'match_id': claim.match_id,
            'status': claim.status,
            'wants_reward': claim.match.found_item.wants_reward,
            'reward_status': reward_status,
        }
