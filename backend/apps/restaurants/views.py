"""
Restaurant Views

Public:
    - GET /api/restaurants/           - List approved restaurants
    - GET /api/restaurants/{id}/      - Restaurant detail
    - GET /api/restaurants/categories/- List cuisine categories

Owner (requires restaurant_owner role):
    - GET/PUT /api/restaurants/my/    - Manage own restaurant
    - POST /api/restaurants/create/   - Create restaurant
"""

from rest_framework import generics, filters, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from .models import Restaurant, RestaurantCategory
from .serializers import (
    RestaurantListSerializer, RestaurantDetailSerializer,
    RestaurantCreateUpdateSerializer, CategorySerializer
)
from .permissions import IsRestaurantOwner


class RestaurantListView(generics.ListAPIView):
    """
    Browse all approved restaurants.
    Supports: ?search=pizza, ?city=Mumbai, ?cuisine=1, ?is_open=true
    Ordering: ?ordering=-rating, ?ordering=delivery_time
    """
    serializer_class = RestaurantListSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['city', 'is_open', 'price_range', 'is_featured']
    search_fields = ['name', 'description', 'city', 'cuisine_types__name']
    ordering_fields = ['rating', 'delivery_time', 'delivery_fee', 'created_at']
    ordering = ['-is_featured', '-rating']

    def get_queryset(self):
        queryset = Restaurant.objects.filter(status='approved').prefetch_related('cuisine_types')
        cuisine_id = self.request.query_params.get('cuisine')
        if cuisine_id:
            queryset = queryset.filter(cuisine_types__id=cuisine_id)
        return queryset


class RestaurantDetailView(generics.RetrieveAPIView):
    """Get full details of a single restaurant."""
    serializer_class = RestaurantDetailSerializer
    permission_classes = [permissions.AllowAny]
    queryset = Restaurant.objects.filter(status='approved')


class RestaurantCategoryListView(generics.ListAPIView):
    """List all cuisine categories with restaurant counts."""
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]
    queryset = RestaurantCategory.objects.filter(is_active=True)


class MyRestaurantView(generics.RetrieveUpdateAPIView):
    """Restaurant owners view and update their restaurant."""
    serializer_class = RestaurantCreateUpdateSerializer
    permission_classes = [permissions.IsAuthenticated, IsRestaurantOwner]

    def get_object(self):
        try:
            return self.request.user.restaurant
        except Restaurant.DoesNotExist:
            from rest_framework.exceptions import NotFound
            raise NotFound("You don't have a restaurant yet.")

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = RestaurantDetailSerializer(instance, context={'request': request})
        return Response(serializer.data)


class CreateRestaurantView(generics.CreateAPIView):
    """Restaurant owner creates their restaurant (one per owner)."""
    serializer_class = RestaurantCreateUpdateSerializer
    permission_classes = [permissions.IsAuthenticated, IsRestaurantOwner]

    def perform_create(self, serializer):
        if hasattr(self.request.user, 'restaurant'):
            from rest_framework.exceptions import ValidationError
            raise ValidationError("You already have a restaurant.")
        serializer.save()


class ToggleRestaurantOpenView(APIView):
    """Quickly toggle restaurant open/closed status."""
    permission_classes = [permissions.IsAuthenticated, IsRestaurantOwner]

    def post(self, request):
        try:
            restaurant = request.user.restaurant
            restaurant.is_open = not restaurant.is_open
            restaurant.save()
            return Response({
                'is_open': restaurant.is_open,
                'message': f"Restaurant is now {'open' if restaurant.is_open else 'closed'}."
            })
        except Restaurant.DoesNotExist:
            return Response({'error': 'Restaurant not found.'}, status=status.HTTP_404_NOT_FOUND)
