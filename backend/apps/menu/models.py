"""
Menu Models

MenuCategory: Starters, Mains, Desserts, Drinks, etc.
MenuItem: Individual food items with pricing and variants
MenuItemVariant: Size/portion variants (Small/Large)
"""

from django.db import models
from apps.restaurants.models import Restaurant


class MenuCategory(models.Model):
    """Food categories within a restaurant menu."""
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='menu_categories')
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    sort_order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'menu_categories'
        ordering = ['sort_order', 'name']

    def __str__(self):
        return f"{self.restaurant.name} > {self.name}"


class MenuItem(models.Model):
    """Individual food/drink items on the menu."""

    FOOD_TYPES = [
        ('veg', 'Vegetarian'),
        ('non_veg', 'Non-Vegetarian'),
        ('vegan', 'Vegan'),
        ('egg', 'Egg'),
    ]

    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='menu_items')
    category = models.ForeignKey(MenuCategory, on_delete=models.SET_NULL, null=True, related_name='items')

    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=8, decimal_places=2)
    image = models.ImageField(upload_to='menu_items/', blank=True, null=True)

    food_type = models.CharField(max_length=10, choices=FOOD_TYPES, default='veg')
    is_bestseller = models.BooleanField(default=False)
    is_available = models.BooleanField(default=True)
    is_customizable = models.BooleanField(default=False)

    # Nutritional info (optional)
    calories = models.PositiveIntegerField(null=True, blank=True)
    prep_time = models.PositiveIntegerField(null=True, blank=True, help_text='Minutes')

    # Ratings
    rating = models.DecimalField(max_digits=3, decimal_places=1, default=0)
    total_orders = models.PositiveIntegerField(default=0)

    sort_order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'menu_items'
        ordering = ['-is_bestseller', 'sort_order', 'name']

    def __str__(self):
        return f"{self.name} - ₹{self.price}"


class MenuItemVariant(models.Model):
    """Size/portion options for menu items."""
    menu_item = models.ForeignKey(MenuItem, on_delete=models.CASCADE, related_name='variants')
    name = models.CharField(max_length=100)  # e.g., "Small", "Large", "Regular"
    price = models.DecimalField(max_digits=8, decimal_places=2)
    is_default = models.BooleanField(default=False)

    class Meta:
        db_table = 'menu_item_variants'

    def __str__(self):
        return f"{self.menu_item.name} - {self.name} (₹{self.price})"


class MenuItemAddon(models.Model):
    """Add-ons/toppings for customizable items."""
    menu_item = models.ForeignKey(MenuItem, on_delete=models.CASCADE, related_name='addons')
    name = models.CharField(max_length=100)  # e.g., "Extra Cheese"
    price = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    is_available = models.BooleanField(default=True)

    class Meta:
        db_table = 'menu_item_addons'

    def __str__(self):
        return f"{self.menu_item.name} + {self.name}"
