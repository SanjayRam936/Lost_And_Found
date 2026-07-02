from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from .models import FoundItems
from .serialization import FoundItemsSerializer


class ReportFoundItemView(generics.CreateAPIView):
    serializer_class = FoundItemsSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        found_item = serializer.save(user=self.request.user)
        # Automatically match this found item against all active lost items.
        from matching.services import run_matching_for_found
        run_matching_for_found(found_item)


class MyFoundItemsView(generics.ListAPIView):
    serializer_class = FoundItemsSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return FoundItems.objects.filter(user=self.request.user).order_by('-created_at')


class FoundItemDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = FoundItemsSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'pk'

    def get_queryset(self):
        return FoundItems.objects.filter(user=self.request.user)
