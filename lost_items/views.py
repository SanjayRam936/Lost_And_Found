from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from .models import LostItems
from .serialization import LostItemsSerializer


class ReportLostItemView(generics.CreateAPIView):
    serializer_class = LostItemsSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        lost_item = serializer.save(user=self.request.user)
        # Automatically match this lost item against all existing found items.
        from matching.services import run_matching_for_lost
        run_matching_for_lost(lost_item)


class MyLostItemsView(generics.ListAPIView):
    serializer_class = LostItemsSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return LostItems.objects.filter(user=self.request.user).order_by('-created_at')


class LostItemDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = LostItemsSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'pk'

    def get_queryset(self):
        # A user can only retrieve/update/delete their own lost items.
        return LostItems.objects.filter(user=self.request.user)
