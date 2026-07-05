from rest_framework import serializers
from .models import MatchItem, VisibilityAccess
from found_items.serialization import FoundItemsSerializer


class MatchItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = MatchItem
        fields = '__all__'


class VisibilityAccessSerializer(serializers.ModelSerializer):
    class Meta:
        model = VisibilityAccess
        fields = '__all__'


class MatchDetailSerializer(serializers.ModelSerializer):
    """
    A match enriched with the matched found item's details. Only ever returned
    to a user who holds VisibilityAccess (Vivar Adar), so exposing the found
    item here is intentional — that is the whole point of a private match.
    """
    found_item = FoundItemsSerializer(read_only=True)
    lost_item_title = serializers.CharField(source='lost_item.title', read_only=True)
    has_claim = serializers.SerializerMethodField()
    claim_id = serializers.SerializerMethodField()
    verification_status = serializers.SerializerMethodField()
    otp_generated = serializers.SerializerMethodField()

    class Meta:
        model = MatchItem
        fields = [
            'id', 'confidence_score', 'text_score', 'image_similarity',
            'match_location', 'time_score', 'status', 'matched_at',
            'lost_item', 'lost_item_title', 'found_item', 'has_claim', 'claim_id',
            'verification_status', 'otp_generated',
        ]

    def get_has_claim(self, obj):
        return hasattr(obj, 'claim')

    def get_claim_id(self, obj):
        return obj.claim.id if hasattr(obj, 'claim') else None

    # Feature 2 — the owner must verify before the found item is revealed.
    def get_verification_status(self, obj):
        return obj.claim.verification_status if hasattr(obj, 'claim') else 'PENDING'

    def get_otp_generated(self, obj):
        return bool(hasattr(obj, 'claim') and obj.claim.otp_code)
