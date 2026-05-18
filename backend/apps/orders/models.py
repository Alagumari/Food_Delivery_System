"""
Orders Models - Complete Order Lifecycle

Order Statuses:
    pending     -> Customer placed order, waiting for restaurant
    accepted    -> Restaurant accepted the order
    preparing   -> Kitchen is preparing the food
    ready       -> Food ready, waiting for delivery partner
    picked_up   -> Delivery partner picked up the order
    on_the_way  -> Delivery partner is heading to customer
    delivered   -> Order successfully delivered
    cancelled   -> Order was cancelled
"""

from django.db import models
from apps.accounts.models import User, Address
from apps.restaurants.models import Restaurant
from apps.menu.models import MenuItem, MenuItemVariant, MenuItemAddon
import uuid


class Order(models.Model):
    """Main order entity."""

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('preparing', 'Preparing'),
        ('ready', 'Ready for Pickup'),
        ('picked_up', 'Picked Up'),
        ('on_the_way', 'On the Way'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
    ]

    PAYMENT_METHODS = [
        ('cod', 'Cash on Delivery'),
        ('card', 'Credit/Debit Card'),
        ('upi', 'UPI'),
        ('wallet', 'Wallet'),
    ]

    PAYMENT_STATUS = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    ]

    # Order identification
    order_number = models.CharField(max_length=20, unique=True, editable=False)

    # Relationships
    customer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders')
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='orders')
    delivery_partner = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='deliveries', limit_choices_to={'role': 'delivery_partner'}
    )

    # Delivery info
    delivery_address = models.TextField()
    delivery_city = models.CharField(max_length=100)
    delivery_pincode = models.CharField(max_length=10)
    delivery_latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    delivery_longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)

    # Pricing
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    delivery_fee = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    tax = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    discount = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=10, decimal_places=2)

    # Payment
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHODS, default='cod')
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS, default='pending')
    payment_id = models.CharField(max_length=100, blank=True)
    razorpay_order_id = models.CharField(max_length=100, blank=True)  # Razorpay order ID

    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')

    # Special instructions
    special_instructions = models.TextField(blank=True)

    # Timestamps
    placed_at = models.DateTimeField(auto_now_add=True)
    accepted_at = models.DateTimeField(null=True, blank=True)
    prepared_at = models.DateTimeField(null=True, blank=True)
    picked_up_at = models.DateTimeField(null=True, blank=True)
    delivered_at = models.DateTimeField(null=True, blank=True)
    estimated_delivery_time = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'orders'
        ordering = ['-placed_at']

    def save(self, *args, **kwargs):
        if not self.order_number:
            self.order_number = f"FR{uuid.uuid4().hex[:8].upper()}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Order #{self.order_number} - {self.customer.email}"

    @property
    def is_cancellable(self):
        """Customer can cancel only before acceptance."""
        return self.status in ['pending']

    @property
    def is_trackable(self):
        """Show tracking for active orders."""
        return self.status in ['accepted', 'preparing', 'ready', 'picked_up', 'on_the_way']


class OrderItem(models.Model):
    """Individual items within an order (snapshot at order time)."""
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    menu_item = models.ForeignKey(MenuItem, on_delete=models.SET_NULL, null=True)
    menu_item_name = models.CharField(max_length=200)  # Snapshot in case item is deleted
    variant_name = models.CharField(max_length=100, blank=True)
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=8, decimal_places=2)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    addons = models.JSONField(default=list, blank=True)  # [{name, price}]
    special_note = models.CharField(max_length=200, blank=True)

    class Meta:
        db_table = 'order_items'

    def __str__(self):
        return f"{self.quantity}x {self.menu_item_name}"


class OrderStatusHistory(models.Model):
    """Track every status change with timestamp and notes."""
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='status_history')
    status = models.CharField(max_length=20)
    changed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    note = models.CharField(max_length=300, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'order_status_history'
        ordering = ['timestamp']

    def __str__(self):
        return f"Order #{self.order.order_number} -> {self.status}"