from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from apps.accounts.models import User
from apps.restaurants.models import Restaurant
from apps.orders.models import Order


class Review(models.Model):
    customer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews')
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='reviews')
    order = models.OneToOneField(Order, on_delete=models.SET_NULL, null=True, blank=True)
    rating = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    comment = models.TextField(blank=True)
    owner_reply = models.TextField(blank=True)
    is_visible = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'reviews'
        unique_together = ('customer', 'restaurant')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.customer.email} -> {self.restaurant.name}: {self.rating}/5"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        self._update_restaurant_rating()

    def _update_restaurant_rating(self):
        from django.db.models import Avg, Count
        stats = Review.objects.filter(
            restaurant=self.restaurant, is_visible=True
        ).aggregate(avg=Avg('rating'), count=Count('id'))
        self.restaurant.rating = round(stats['avg'] or 0, 1)
        self.restaurant.total_reviews = stats['count']
        self.restaurant.save(update_fields=['rating', 'total_reviews'])
