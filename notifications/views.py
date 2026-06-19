from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated

from .models import Notification
from .serializers import NotificationSerializer

class NotificationListView(generics.ListAPIView):
    """ List all notifications. Should be filtered by the logged-in user. """
    serializer_class = NotificationSerializer
    # permission_classes = [IsAuthenticated] # Uncomment when auth is ready
    
    def get_queryset(self):
        # In production, filter by user: return Notification.objects.filter(user=self.request.user)
        return Notification.objects.all()

class MarkAllReadView(APIView):
    """ Mark all unread notifications as read """
    # permission_classes = [IsAuthenticated]
    
    def post(self, request):
        # In production: Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
        Notification.objects.filter(is_read=False).update(is_read=True)
        return Response({"message": "All notifications marked as read."}, status=status.HTTP_200_OK)

class MarkSingleReadView(APIView):
    """ Mark a specific notification as read """
    # permission_classes = [IsAuthenticated]
    
    def post(self, request, pk):
        try:
            # In production: notification = Notification.objects.get(pk=pk, user=request.user)
            notification = Notification.objects.get(pk=pk)
            notification.is_read = True
            notification.save()
            return Response({"message": "Notification marked as read."}, status=status.HTTP_200_OK)
        except Notification.DoesNotExist:
            return Response({"error": "Notification not found."}, status=status.HTTP_404_NOT_FOUND)
