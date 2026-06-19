from rest_framework import generics
from .models import LostItems
from .serialization import LostItemsSerializer
from rest_framework.permissions import IsAuthenticated


class ReportLostItemView(generics.CreateAPIView):
    queryset = LostItems.objects.all()
    #permission_classes = [IsAuthenticated]
    serializer_class = LostItemsSerializer 


class LostItemDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = LostItems.objects.all()
    #permission_classes = [IsAuthenticated]
    serializer_class = LostItemsSerializer 
    lookup_field = 'pk'