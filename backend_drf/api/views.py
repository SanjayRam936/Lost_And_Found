from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAdminUser
from django.contrib.auth import get_user_model

from lost_items.models import LostItems
from found_items.models import FoundItems
from matching.models import MatchItem
from claims.models import Claim
from rewards.models import Reward

User = get_user_model()


class AdminStatsView(APIView):
    """GET /admin/stats/ — headline metrics for the admin overview."""
    permission_classes = [IsAdminUser]

    def get(self, request):
        return Response({
            "users": User.objects.count(),
            "lost_items": LostItems.objects.count(),
            "found_items": FoundItems.objects.count(),
            "active_reports": LostItems.objects.filter(status='ACTIVE').count(),
            "matched_items": LostItems.objects.filter(status='MATCHED').count(),
            "resolved_items": LostItems.objects.filter(status='RESOLVED').count(),
            "total_matches": MatchItem.objects.count(),
            "strong_matches": MatchItem.objects.filter(status__in=['STRONG', 'REVIEW']).count(),
            "claims": Claim.objects.count(),
            "resolved_claims": Claim.objects.filter(status='RESOLVED').count(),
            "rewards_paid": Reward.objects.filter(escrow_status='RELEASED').count(),
        }, status=status.HTTP_200_OK)


class AdminUsersView(APIView):
    """GET /admin/users/ — all users with their report counts."""
    permission_classes = [IsAdminUser]

    def get(self, request):
        users = User.objects.all().order_by('id')
        data = [{
            "id": u.id,
            "email": u.email,
            "full_name": u.full_name,
            "phone_number": u.phone_number,
            "is_staff": u.is_staff,
            "is_active": u.is_active,
            "lost_count": u.lost_items.count(),
            "found_count": u.found_items.count(),
            "date_joined": u.date_joined,
        } for u in users]
        return Response(data, status=status.HTTP_200_OK)


class AdminItemsView(APIView):
    """GET /admin/items/ — every lost and found report."""
    permission_classes = [IsAdminUser]

    def get(self, request):
        lost = [{
            "id": i.id, "type": "lost", "title": i.title, "category": i.category,
            "color": i.color, "location": i.location, "status": i.status,
            "user": i.user.email, "date": i.date, "created_at": i.created_at,
            "image": i.image.url if i.image else None,
        } for i in LostItems.objects.select_related('user').order_by('-id')]

        found = [{
            "id": i.id, "type": "found", "title": i.title, "category": i.category,
            "color": i.color, "location": i.location, "handover_type": i.handover_type,
            "wants_reward": i.wants_reward, "user": i.user.email, "date": i.date,
            "created_at": i.created_at,
            "image": i.image.url if i.image else None,
        } for i in FoundItems.objects.select_related('user').order_by('-id')]

        return Response({"lost_items": lost, "found_items": found}, status=status.HTTP_200_OK)


class AdminMatchesView(APIView):
    """GET /admin/matches/ — every AI match with readable item/user info."""
    permission_classes = [IsAdminUser]

    def get(self, request):
        matches = MatchItem.objects.select_related(
            'lost_item', 'lost_item__user', 'found_item', 'found_item__user'
        ).order_by('-confidence_score')
        data = [{
            "id": m.id,
            "lost_item": m.lost_item.title,
            "lost_user": m.lost_item.user.email,
            "lost_image": m.lost_item.image.url if m.lost_item.image else None,
            "found_item": m.found_item.title,
            "found_user": m.found_item.user.email,
            "found_image": m.found_item.image.url if m.found_item.image else None,
            "confidence_score": round(m.confidence_score, 3),
            "text_score": round(m.text_score, 3),
            "image_similarity": round(m.image_similarity, 3),
            "status": m.status,
            "matched_at": m.matched_at,
        } for m in matches]
        return Response(data, status=status.HTTP_200_OK)


class AdminClaimsView(APIView):
    """GET /admin/claims/ — every claim with owner/finder and OTP state."""
    permission_classes = [IsAdminUser]

    def get(self, request):
        claims = Claim.objects.select_related(
            'match', 'match__lost_item', 'match__lost_item__user',
            'match__found_item', 'match__found_item__user',
        ).order_by('-id')
        data = [{
            "id": c.id,
            "item": c.match.lost_item.title,
            "owner": c.match.lost_item.user.email,
            "finder": c.match.found_item.user.email,
            "handover_type": c.handover_type,
            "otp_verified": c.otp_verified,
            "status": c.status,
            "created_at": c.created_at,
        } for c in claims]
        return Response(data, status=status.HTTP_200_OK)
