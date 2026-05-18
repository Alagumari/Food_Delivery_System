"""
Accounts Serializers
Handles user registration, login, profile management
"""

from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.password_validation import validate_password
from .models import User, Address


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Enhanced JWT serializer that includes user info in token response."""

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Add custom claims to token
        token['email'] = user.email
        token['role'] = user.role
        token['full_name'] = user.get_full_name()
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        # Include user details in login response
        data['user'] = {
            'id': self.user.id,
            'email': self.user.email,
            'full_name': self.user.get_full_name(),
            'role': self.user.role,
            'phone': self.user.phone,
            'profile_picture': self.user.profile_picture.url if self.user.profile_picture else None,
        }
        return data


class RegisterSerializer(serializers.ModelSerializer):
    """User registration with password confirmation."""

    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password_confirm',
                  'first_name', 'last_name', 'phone', 'role')
        extra_kwargs = {
            'first_name': {'required': True},
            'last_name': {'required': True},
            'email': {'required': True},
        }

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password": "Passwords do not match."})
        return attrs

    def validate_role(self, value):
        # Prevent self-assigning admin role
        if value == 'admin':
            raise serializers.ValidationError("Cannot register as admin.")
        return value

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        return user


class UserProfileSerializer(serializers.ModelSerializer):
    """Detailed user profile serializer."""

    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name',
                  'full_name', 'phone', 'role', 'profile_picture', 'is_verified',
                  'created_at')
        read_only_fields = ('id', 'email', 'role', 'is_verified', 'created_at')

    def get_full_name(self, obj):
        return obj.get_full_name()


class AddressSerializer(serializers.ModelSerializer):
    """Address management serializer."""

    class Meta:
        model = Address
        fields = ('id', 'label', 'full_address', 'city', 'state',
                  'pincode', 'landmark', 'latitude', 'longitude',
                  'is_default', 'created_at')
        read_only_fields = ('id', 'created_at')

    def create(self, validated_data):
        # Attach current user automatically
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)
