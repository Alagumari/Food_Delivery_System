from django.urls import path
from .views import (
    RestaurantListView, RestaurantDetailView, RestaurantCategoryListView,
    MyRestaurantView, CreateRestaurantView, ToggleRestaurantOpenView
)

urlpatterns = [
    path('', RestaurantListView.as_view(), name='restaurant_list'),
    path('<int:pk>/', RestaurantDetailView.as_view(), name='restaurant_detail'),
    path('categories/', RestaurantCategoryListView.as_view(), name='categories'),

    # Owner endpoints
    path('my/', MyRestaurantView.as_view(), name='my_restaurant'),
    path('create/', CreateRestaurantView.as_view(), name='create_restaurant'),
    path('toggle-open/', ToggleRestaurantOpenView.as_view(), name='toggle_open'),
]
