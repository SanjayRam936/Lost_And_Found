from rest_framework import serializers
from validation.engine import run_report_validation
from validation import spam_protector
from .models import FoundItems

# AI-prep fields are populated by the validation engine, never accepted from the
# client (kept read-only so they can't be injected).
_AI_PREP_FIELDS = [
    'extracted_keywords', 'description_embedding', 'detected_objects',
    'dominant_colors_detected', 'normalized_title', 'image_hash',
]


class FoundItemsSerializer(serializers.ModelSerializer):
    # Finder-facing signals: did this found item match a lost report, and has
    # the owner started a claim (generated an OTP) on it?
    is_matched = serializers.SerializerMethodField()
    claim = serializers.SerializerMethodField()

    class Meta:
        model = FoundItems
        fields = '__all__'
        read_only_fields = ['user', 'created_at'] + _AI_PREP_FIELDS

    # ── Full validation engine (photo MANDATORY for found reports) ──────────
    def validate(self, attrs):
        if self.instance is not None:
            return attrs                               # skip heavy checks on edit

        request = self.context.get('request')
        result = run_report_validation(
            attrs, attrs.get('image'),
            getattr(request, 'user', None), request, is_found=True,
        )
        attrs.update(result['extracted'])              # save normalized/AI fields
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
        # Strip internal AI-prep fields (esp. the 384-float embedding) from the
        # API payload — only the matching engine uses them server-side.
        for f in _AI_PREP_FIELDS:
            data.pop(f, None)
        warnings = getattr(self, '_validation_warnings', None)
        if warnings:
            data['validation_warnings'] = warnings     # non-blocking soft warnings
        return data

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
