from rest_framework import serializers
from .models import FoundItems

class FoundItemsSerializer(serializers.ModelSerializer):
    class Meta:
        model = FoundItems
        fields = '__all__'  