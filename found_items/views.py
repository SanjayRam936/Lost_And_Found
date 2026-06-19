from django.shortcuts import render
from rest_framework import generics
from .models import FoundItems
from .serialization import FoundItemsSerializer
from rest_framework.permissions import IsAuthenticated


# Create your views here.
class ReportFoundItemView(generics.CreateAPIView):
    queryset = FoundItems.objects.all()
    #permission_classes = [IsAuthenticated]
    serializer_class = FoundItemsSerializer 


class FoundItemDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = FoundItems.objects.all()
    #permission_classes = [IsAuthenticated]
    serializer_class = FoundItemsSerializer 
    lookup_field = 'pk'