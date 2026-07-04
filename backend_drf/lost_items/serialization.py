from rest_framework import serializers
from validation.engine import run_report_validation
from validation import spam_protector
from .models import LostItems

_AI_PREP_FIELDS = [
    'extracted_keywords', 'description_embedding', 'detected_objects',
    'dominant_colors_detected', 'normalized_title', 'image_hash',
]


class LostItemsSerializer(serializers.ModelSerializer):
    # Owner-facing claim/reward state so the product list can route to the
    # reward page after a handover.
    claim = serializers.SerializerMethodField()

    class Meta:
        model = LostItems
        fields = '__all__'
        read_only_fields = ['user', 'status', 'created_at'] + _AI_PREP_FIELDS

    # ── Feature 1: enforce the coordinates required by the location mode ──────
    def _validate_location_mode(self, attrs):
        def current(field):
            if field in attrs:
                return attrs[field]
            return getattr(self.instance, field, None)

        location_type = current('location_type') or 'EXACT'
        if location_type == 'EXACT':
            if current('latitude') is None or current('longitude') is None:
                raise serializers.ValidationError(
                    {'location': 'An exact location requires a pinned latitude and longitude.'})
        elif location_type == 'ROUTE':
            missing = [f for f in ('source_latitude', 'source_longitude',
                                   'dest_latitude', 'dest_longitude') if current(f) is None]
            if missing:
                raise serializers.ValidationError(
                    {'location': 'A route location requires both source and destination coordinates.'})
        return attrs

    # ── Full validation engine (photo OPTIONAL for lost reports) ─────────────
    def validate(self, attrs):
        if self.instance is not None:
            return self._validate_location_mode(attrs)     # lightweight on edit

        request = self.context.get('request')
        result = run_report_validation(
            attrs, attrs.get('image'),
            getattr(request, 'user', None), request, is_found=False,
        )
        attrs.update(result['extracted'])
        if result.get('resolved_location'):
            attrs['location'] = result['resolved_location']
        self._validation_warnings = result.get('warnings', [])
        return attrs

    def create(self, validated_data):
        instance = super().create(validated_data)
        request = self.context.get('request')
        spam_protector.record_submission(getattr(request, 'user', None), request)
        return instance

    def to_representation(self, instance):
        data = super().to_representation(instance)
        warnings = getattr(self, '_validation_warnings', None)
        if warnings:
            data['validation_warnings'] = warnings
        return data

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
