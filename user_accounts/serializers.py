from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, style={'input_type': 'password'}, min_length=8)
    class Meta:
        model = User
        fields = ['username', 'email', 'phone_number', 'password']


    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user