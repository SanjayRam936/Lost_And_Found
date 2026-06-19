from rest_framework import serializers
from .models import MatchItem, VisibilityAccess

class MatchItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = MatchItem
        fields = '__all__'

class VisibilityAccessSerializer(serializers.ModelSerializer):
    class Meta:
        model = VisibilityAccess
        fields = '__all__'