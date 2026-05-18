from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Address


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('email', 'get_full_name', 'role', 'is_verified', 'date_joined')
    list_filter = ('role', 'is_verified', 'is_active')
    search_fields = ('email', 'first_name', 'last_name', 'username')
    ordering = ('-date_joined',)
    fieldsets = UserAdmin.fieldsets + (
        ('FoodRush Info', {'fields': ('phone', 'role', 'profile_picture', 'is_verified')}),
    )


@admin.register(Address)
class AddressAdmin(admin.ModelAdmin):
    list_display = ('user', 'label', 'city', 'pincode', 'is_default')
    list_filter = ('label', 'is_default')
