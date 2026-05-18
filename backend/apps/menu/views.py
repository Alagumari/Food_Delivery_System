"""Menu Views"""
from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import MenuCategory, MenuItem
from .serializers import MenuCategorySerializer, MenuItemSerializer, MenuItemCreateSerializer
from apps.restaurants.permissions import IsRestaurantOwner


class RestaurantMenuView(generics.ListAPIView):
    """Get full menu for a restaurant, grouped by category."""
    permission_classes = [permissions.AllowAny]

    def get(self, request, restaurant_id):
        categories = MenuCategory.objects.filter(
            restaurant_id=restaurant_id, is_active=True
        ).prefetch_related('items__variants', 'items__addons')
        serializer = MenuCategorySerializer(categories, many=True)
        
        # Also include uncategorized items
        uncategorized = MenuItem.objects.filter(
            restaurant_id=restaurant_id, category__isnull=True, is_available=True
        )
        
        return Response({
            'categories': serializer.data,
            'uncategorized': MenuItemSerializer(uncategorized, many=True).data
        })


class MenuItemListCreateView(generics.ListCreateAPIView):
    """Owner: list or add menu items."""
    permission_classes = [permissions.IsAuthenticated, IsRestaurantOwner]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return MenuItemCreateSerializer
        return MenuItemSerializer

    def get_queryset(self):
        return MenuItem.objects.filter(restaurant=self.request.user.restaurant)


class MenuItemDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Owner: get, update, or delete a menu item."""
    permission_classes = [permissions.IsAuthenticated, IsRestaurantOwner]
    serializer_class = MenuItemCreateSerializer

    def get_queryset(self):
        return MenuItem.objects.filter(restaurant=self.request.user.restaurant)


class ToggleItemAvailabilityView(APIView):
    """Quickly toggle an item's availability."""
    permission_classes = [permissions.IsAuthenticated, IsRestaurantOwner]

    def post(self, request, pk):
        try:
            item = MenuItem.objects.get(pk=pk, restaurant=request.user.restaurant)
            item.is_available = not item.is_available
            item.save()
            return Response({'is_available': item.is_available})
        except MenuItem.DoesNotExist:
            from rest_framework.exceptions import NotFound
            raise NotFound('Item not found.')
