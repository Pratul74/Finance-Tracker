from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.password_validation import validate_password
from .models import User

class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)
    class Meta:
        model = User
        fields = ['name', 'email', 'password', 'confirm_password']
    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError("Passwords do not match")
        validate_password(data['password'])
        if User.objects.filter(email=data['email']).exists():
            raise serializers.ValidationError("Email already exists")

        return data

    def create(self, validated_data):
        validated_data.pop('confirm_password')

        user = User.objects.create_user(
            name=validated_data['name'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user



class CustomTokenSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['user_id'] = user.id
        token['email'] = user.email
        token['name'] = user.name

        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = {
            "id": self.user.id,
            "name": self.user.name,
            "email": self.user.email
        }

        return data