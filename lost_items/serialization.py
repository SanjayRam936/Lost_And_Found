from rest_framework import serializers
from .models import LostItems

class LostItemsSerializer(serializers.ModelSerializer):
    class Meta:
        model = LostItems
        fields = '__all__' 

    