"""
Accounts Views - Authentication & Profile Management
Endpoints:
    - POST /api/auth/register/
    - POST /api/auth/login/
    - POST /api/auth/token/refresh/
    - GET/PUT /api/auth/profile/
    - CRUD /api/auth/addresses/
"""

from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import User, Address
from .serializers import (
    RegisterSerializer, CustomTokenObtainPairSerializer,
    UserProfileSerializer, AddressSerializer
)


class RegisterView(generics.CreateAPIView):
    """
    Register a new user.
    
    POST /api/auth/register/
    {
        "username": "john_doe",
        "email": "john@example.com",
        "password": "securepass123",
        "password_confirm": "securepass123",
        "first_name": "John",
        "last_name": "Doe",
        "phone": "+91-9876543210",
        "role": "customer"  // customer | restaurant_owner | delivery_partner
    }
    """
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response({
            'message': 'Registration successful! Please login.',
            'user': {
                'id': user.id,
                'email': user.email,
                'role': user.role,
                'full_name': user.get_full_name(),
            }
        }, status=status.HTTP_201_CREATED)


class LoginView(TokenObtainPairView):
    """
    Login and receive JWT tokens.
    
    POST /api/auth/login/
    { "email": "john@example.com", "password": "securepass123" }
    
    Returns: { access, refresh, user: {...} }
    """
    serializer_class = CustomTokenObtainPairSerializer
    permission_classes = [permissions.AllowAny]


class ProfileView(generics.RetrieveUpdateAPIView):
    """
    Get or update current user's profile.
    
    GET  /api/auth/profile/   -> returns user data
    PUT  /api/auth/profile/   -> update user data
    PATCH /api/auth/profile/  -> partial update
    """
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class AddressListCreateView(generics.ListCreateAPIView):
    """List user's addresses or add a new one."""
    serializer_class = AddressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Address.objects.filter(user=self.request.user).order_by('-is_default', '-created_at')


class AddressDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Get, update, or delete a specific address."""
    serializer_class = AddressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)


class SetDefaultAddressView(APIView):
    """Set an address as default."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            address = Address.objects.get(pk=pk, user=request.user)
            # Remove existing default
            Address.objects.filter(user=request.user, is_default=True).update(is_default=False)
            address.is_default = True
            address.save()
            return Response({'message': 'Default address updated.'})
        except Address.DoesNotExist:
            return Response({'error': 'Address not found.'}, status=status.HTTP_404_NOT_FOUND)
