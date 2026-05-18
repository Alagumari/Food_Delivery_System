from django.urls import path
from .views import RestaurantReviewsView, CreateReviewView

urlpatterns = [
    path('restaurant/<int:restaurant_id>/', RestaurantReviewsView.as_view(), name='restaurant_reviews'),
    path('create/', CreateReviewView.as_view(), name='create_review'),
]
