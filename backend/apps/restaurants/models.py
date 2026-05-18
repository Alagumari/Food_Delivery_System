"""
Restaurant Models

Covers:
    - Restaurant: Main restaurant entity
    - RestaurantCategory: Cuisine types (Indian, Chinese, etc.)
    - RestaurantImage: Multiple photos per restaurant
    - BusinessHours: Operating hours per day
"""

from django.db import models
from apps.accounts.models import User


class RestaurantCategory(models.Model):
    """Cuisine categories - Indian, Chinese, Italian, etc."""
    name = models.CharField(max_length=100, unique=True)
    icon = models.CharField(max_length=100, blank=True)  # emoji or icon name
    image = models.ImageField(upload_to='categories/', blank=True, null=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'restaurant_categories'
        verbose_name_plural = 'Restaurant Categories'

    def __str__(self):
        return self.name


class Restaurant(models.Model):
    """Core restaurant entity with all business details."""

    STATUS_CHOICES = [
        ('pending', 'Pending Approval'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('suspended', 'Suspended'),
    ]

    PRICE_RANGE_CHOICES = [
        ('$', 'Budget'),
        ('$$', 'Moderate'),
        ('$$$', 'Premium'),
        ('$$$$', 'Luxury'),
    ]

    # Ownership
    owner = models.OneToOneField(User, on_delete=models.CASCADE, related_name='restaurant')

    # Basic Info
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    cuisine_types = models.ManyToManyField(RestaurantCategory, related_name='restaurants')

    # Contact
    phone = models.CharField(max_length=15)
    email = models.EmailField(blank=True)

    # Location
    address = models.TextField()
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    pincode = models.CharField(max_length=10)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)

    # Media
    logo = models.ImageField(upload_to='restaurants/logos/', blank=True, null=True)
    cover_image = models.ImageField(upload_to='restaurants/covers/', blank=True, null=True)

    # Business Details
    min_order = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    delivery_time = models.PositiveIntegerField(default=30, help_text='Estimated delivery in minutes')
    delivery_fee = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    price_range = models.CharField(max_length=5, choices=PRICE_RANGE_CHOICES, default='$$')

    # Ratings (denormalized for performance)
    rating = models.DecimalField(max_digits=3, decimal_places=1, default=0)
    total_reviews = models.PositiveIntegerField(default=0)
    total_orders = models.PositiveIntegerField(default=0)

    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    is_open = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'restaurants'
        ordering = ['-is_featured', '-rating', '-total_orders']

    def __str__(self):
        return f"{self.name} ({self.city})"


class BusinessHours(models.Model):
    """Operating hours for each day of the week."""

    DAYS = [
        (0, 'Monday'), (1, 'Tuesday'), (2, 'Wednesday'),
        (3, 'Thursday'), (4, 'Friday'), (5, 'Saturday'), (6, 'Sunday'),
    ]

    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='business_hours')
    day = models.IntegerField(choices=DAYS)
    open_time = models.TimeField()
    close_time = models.TimeField()
    is_closed = models.BooleanField(default=False)

    class Meta:
        db_table = 'business_hours'
        unique_together = ('restaurant', 'day')

    def __str__(self):
        return f"{self.restaurant.name} - {self.get_day_display()}"
