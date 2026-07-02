from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db.models import Q

from matching.models import MatchItem
from .models import ChatMessage
from .serializers import ChatMessageSerializer


def _display_name(user):
    return (user.full_name or '').strip() or user.email


def _match_participants(match):
    """Both sides of a match may chat: the lost-item owner and the found-item finder."""
    return {match.lost_item.user_id, match.found_item.user_id}


class MyChatThreadsView(APIView):
    """GET /chat/threads/ — conversations the user is part of (once a claim exists)."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        matches = (
            MatchItem.objects
            .filter(Q(lost_item__user=user) | Q(found_item__user=user))
            .select_related('lost_item', 'found_item', 'lost_item__user', 'found_item__user')
        )
        threads = []
        for match in matches:
            has_claim = hasattr(match, 'claim')
            last = match.messages.last()
            if not has_claim and last is None:
                continue  # only show threads once a handover/claim has started
            is_owner = match.lost_item.user_id == user.id
            other = match.found_item.user if is_owner else match.lost_item.user
            item_title = match.found_item.title if is_owner else match.lost_item.title
            threads.append({
                'match_id': match.id,
                'name': _display_name(other),
                'item': item_title,
                'last_message': last.message if last else '',
                'time': last.timestamp if last else None,
            })
        threads.sort(key=lambda t: (t['time'] is not None, t['time']), reverse=True)
        return Response(threads)


class ChatThreadView(generics.ListCreateAPIView):
    """
    GET  /chat/<match_id>/messages/  -> message history for this match
    POST /chat/<match_id>/messages/  -> send a message

    Scoped to one MatchItem; only that match's two participants have access.
    """
    serializer_class = ChatMessageSerializer
    permission_classes = [IsAuthenticated]

    def _get_match_or_403(self):
        match = get_object_or_404(MatchItem, pk=self.kwargs['match_id'])
        if self.request.user.id not in _match_participants(match):
            return None
        return match

    def list(self, request, *args, **kwargs):
        match = self._get_match_or_403()
        if match is None:
            return Response({"detail": "Access denied."}, status=status.HTTP_403_FORBIDDEN)
        qs = ChatMessage.objects.filter(match=match)
        return Response(ChatMessageSerializer(qs, many=True, context={'request': request}).data)

    def create(self, request, *args, **kwargs):
        match = self._get_match_or_403()
        if match is None:
            return Response({"detail": "Access denied."}, status=status.HTTP_403_FORBIDDEN)
        text = (request.data.get('message') or '').strip()
        if not text:
            return Response({"detail": "Message cannot be empty."}, status=status.HTTP_400_BAD_REQUEST)
        msg = ChatMessage.objects.create(match=match, sender=request.user, message=text)
        return Response(
            ChatMessageSerializer(msg, context={'request': request}).data,
            status=status.HTTP_201_CREATED,
        )
