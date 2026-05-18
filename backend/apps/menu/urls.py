from django.urls import path
from .views import RestaurantMenuView, MenuItemListCreateView, MenuItemDetailView, ToggleItemAvailabilityView

urlpatterns = [
    path('<int:restaurant_id>/', RestaurantMenuView.as_view(), name='restaurant_menu'),
    path('items/', MenuItemListCreateView.as_view(), name='menu_items'),
    path('items/<int:pk>/', MenuItemDetailView.as_view(), name='menu_item_detail'),
    path('items/<int:pk>/toggle/', ToggleItemAvailabilityView.as_view(), name='toggle_item'),
]
