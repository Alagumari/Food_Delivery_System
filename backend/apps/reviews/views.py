"""Reviews Views"""
from rest_framework import generics, permissions
from .models import Review
from .serializers import ReviewSerializer, CreateReviewSerializer


class RestaurantReviewsView(generics.ListAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return Review.objects.filter(
            restaurant_id=self.kwargs['restaurant_id'], is_visible=True
        )


class CreateReviewView(generics.CreateAPIView):
    serializer_class = CreateReviewSerializer
    permission_classes = [permissions.IsAuthenticated]
