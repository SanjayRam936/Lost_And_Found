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

    def validate(self, attrs):
        """Feature 1 — enforce the coordinates required by the chosen location mode.
        EXACT needs a pinned lat/lng; ROUTE needs source + destination coordinates.
        On a partial update (PATCH) fall back to the instance's current values."""
        def current(field):
            if field in attrs:
                return attrs[field]
            return getattr(self.instance, field, None)

        location_type = current('location_type') or 'EXACT'

        if location_type == 'EXACT':
            if current('latitude') is None or current('longitude') is None:
                raise serializers.ValidationError(
                    {'location': 'An exact location requires a pinned latitude and longitude.'}
                )
        elif location_type == 'ROUTE':
            missing = [f for f in (
                'source_latitude', 'source_longitude', 'dest_latitude', 'dest_longitude'
            ) if current(f) is None]
            if missing:
                raise serializers.ValidationError(
                    {'location': 'A route location requires both source and destination coordinates.'}
                )
        return attrs

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
