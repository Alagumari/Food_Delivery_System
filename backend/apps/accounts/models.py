"""
Accounts Models - Custom User with Role-Based Authentication

Roles:
    - customer: Can browse, order, review
    - restaurant_owner: Can manage restaurant and menu
    - delivery_partner: Can accept deliveries
    - admin: Full platform access
"""

from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """Extended user model with role-based access control."""

    ROLE_CHOICES = [
        ('customer', 'Customer'),
        ('restaurant_owner', 'Restaurant Owner'),
        ('delivery_partner', 'Delivery Partner'),
        ('admin', 'Admin'),
    ]

    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=15, blank=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='customer')
    profile_picture = models.ImageField(upload_to='profiles/', blank=True, null=True)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']

    class Meta:
        db_table = 'users'

    def __str__(self):
        return f"{self.get_full_name()} ({self.email}) - {self.role}"

    @property
    def is_customer(self):
        return self.role == 'customer'

    @property
    def is_restaurant_owner(self):
        return self.role == 'restaurant_owner'

    @property
    def is_delivery_partner(self):
        return self.role == 'delivery_partner'


class Address(models.Model):
    """Customer delivery addresses."""

    ADDRESS_TYPES = [
        ('home', 'Home'),
        ('work', 'Work'),
        ('other', 'Other'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='addresses')
    label = models.CharField(max_length=20, choices=ADDRESS_TYPES, default='home')
    full_address = models.TextField()
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    pincode = models.CharField(max_length=10)
    landmark = models.CharField(max_length=200, blank=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    is_default = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'addresses'

    def __str__(self):
        return f"{self.user.email} - {self.label}: {self.city}"

    def save(self, *args, **kwargs):
        # Ensure only one default address per user
        if self.is_default:
            Address.objects.filter(user=self.user, is_default=True).update(is_default=False)
        super().save(*args, **kwargs)
