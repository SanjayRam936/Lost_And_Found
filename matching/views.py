from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import generics, status
from .models import MatchItem, VisibilityAccess
from .serializers import MatchItemSerializer
from lost_items.models import LostItems
from found_items.models import FoundItems
import math
from datetime import datetime

# ── HELPER FUNCTIONS ────────────────────────────────────────────

def compute_text_score(lost_desc, found_desc):
    if not lost_desc or not found_desc:
        return 0.0

    lost_words  = set(lost_desc.lower().split())
    found_words = set(found_desc.lower().split())
    common      = lost_words.intersection(found_words)

    score = len(common) / len(lost_words.union(found_words))
    return round(score, 4)


def compute_category_score(lost_category, found_category):
    if not lost_category or not found_category:
        return 0.0
    return 1.0 if lost_category.lower() == found_category.lower() else 0.0


def compute_color_score(lost_color, found_color):
    if not lost_color or not found_color:
        return 0.0
    return 1.0 if lost_color.lower() == found_color.lower() else 0.0


def compute_location_score(lost_lat, lost_lng, found_lat, found_lng):
    if None in [lost_lat, lost_lng, found_lat, found_lng]:
        return 0.0

    R    = 6371
    lat1 = math.radians(float(lost_lat))
    lat2 = math.radians(float(found_lat))
    dlat = math.radians(float(found_lat) - float(lost_lat))
    dlng = math.radians(float(found_lng) - float(lost_lng))

    a           = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlng/2)**2
    distance_km = R * 2 * math.asin(math.sqrt(a))

    max_radius = 5.0
    if distance_km >= max_radius:
        return 0.0

    return round(1.0 - (distance_km / max_radius), 4)


def compute_time_score(lost_date, found_date):
    if not lost_date or not found_date:
        return 0.0

    # Convert date to datetime if needed
    if not isinstance(lost_date, datetime):
        lost_date = datetime.combine(lost_date, datetime.min.time())
    if not isinstance(found_date, datetime):
        found_date = datetime.combine(found_date, datetime.min.time())

    diff_hours = abs((found_date - lost_date).total_seconds()) / 3600
    max_hours  = 30 * 24

    if diff_hours >= max_hours:
        return 0.0

    return round(1.0 - (diff_hours / max_hours), 4)


def compute_confidence_score(text_score, category_score, color_score, location_score, time_score):
    weights = {
        'category': 0.25,
        'text':     0.25,
        'color':    0.15,
        'location': 0.20,
        'time':     0.15,
    }

    final = (
        category_score * weights['category'] +
        text_score     * weights['text']     +
        color_score    * weights['color']    +
        location_score * weights['location'] +
        time_score     * weights['time']
    )
    return round(final, 4)


def get_match_status(confidence_score):
    if confidence_score >= 0.85:
        return 'STRONG'
    elif confidence_score >= 0.75:
        return 'REVIEW'
    else:
        return 'PENDING'


# ── VIEWS ────────────────────────────────────────────────────────

class RunMatchingView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, found_id):

        # Step 1 — Get the found item
        try:
            found_item = FoundItems.objects.get(id=found_id)
        except FoundItems.DoesNotExist:
            return Response(
                {"error": "Found item not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        # Step 2 — Get all active lost items
        lost_items = LostItems.objects.filter(status='ACTIVE')

        if not lost_items.exists():
            return Response(
                {"message": "No active lost items to match against"},
                status=status.HTTP_200_OK
            )

        # Step 3 — Compute scores for each lost item
        match_results = []

        for lost_item in lost_items:

            text_score     = compute_text_score(
                                lost_item.description,
                                found_item.description
                             )
            category_score = compute_category_score(
                                lost_item.category,
                                found_item.category
                             )
            color_score    = compute_color_score(
                                lost_item.color,
                                found_item.color
                             )
            location_score = compute_location_score(
                                lost_item.latitude,
                                lost_item.longitude,
                                found_item.latitude,
                                found_item.longitude
                             )
            time_score     = compute_time_score(
                                lost_item.date,
                                found_item.date
                             )
            confidence     = compute_confidence_score(
                                text_score,
                                category_score,
                                color_score,
                                location_score,
                                time_score
                             )

            match_results.append({
                'lost_item':      lost_item,
                'confidence':     confidence,
                'text_score':     text_score,
                'image_score':    0.0,  # Phase 2 — image embedding
                'color_score':    color_score,
                'location_score': location_score,
                'time_score':     time_score,
            })

        # Step 4 — Sort by confidence, take top 5
        top_matches = sorted(
            match_results,
            key=lambda x: x['confidence'],
            reverse=True
        )[:5]

        # Step 5 — Save matches and grant VisibilityAccess
        saved_matches = []

        for result in top_matches:
            match = MatchItem.objects.create(
                lost_item        = result['lost_item'],
                found_item       = found_item,
                confidence_score = result['confidence'],
                text_score       = result['text_score'],
                image_similarity = result['image_score'],
                match_location   = result['location_score'],
                time_score       = result['time_score'],
                status           = get_match_status(result['confidence'])
            )

            # Vivar Adar — grant access to lost item owner only
            VisibilityAccess.objects.get_or_create(
                match = match,
                user  = result['lost_item'].user
            )

            saved_matches.append(match)

        # Step 6 — Return results
        serializer = MatchItemSerializer(saved_matches, many=True)
        return Response({
            "message":       f"{len(saved_matches)} matches found",
            "found_item_id": found_id,
            "matches":       serializer.data
        }, status=status.HTTP_201_CREATED)


class MatchResultsView(generics.ListAPIView):
    serializer_class   = MatchItemSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user     = self.request.user
        found_id = self.kwargs['found_id']

        accessible_match_ids = VisibilityAccess.objects.filter(
            user=user
        ).values_list('match_id', flat=True)

        return MatchItem.objects.filter(
            id__in=accessible_match_ids,
            found_item_id=found_id
        ).order_by('-confidence_score')


class DismissMatchView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, match_id):
        try:
            access       = VisibilityAccess.objects.get(
                               match_id=match_id,
                               user=request.user
                           )
            match        = access.match
            match.status = 'DISMISSED'
            match.save()
            return Response(
                {"message": "Match dismissed successfully"},
                status=status.HTTP_200_OK
            )
        except VisibilityAccess.DoesNotExist:
            return Response(
                {"error": "Access denied"},
                status=status.HTTP_403_FORBIDDEN
            )