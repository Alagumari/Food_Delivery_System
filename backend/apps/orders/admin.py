from django.contrib import admin
from .models import Order, OrderItem, OrderStatusHistory


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ('total_price',)


class StatusHistoryInline(admin.TabularInline):
    model = OrderStatusHistory
    extra = 0
    readonly_fields = ('timestamp',)


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('order_number', 'customer', 'restaurant', 'status', 'total', 'payment_method', 'placed_at')
    list_filter = ('status', 'payment_method', 'payment_status')
    search_fields = ('order_number', 'customer__email', 'restaurant__name')
    readonly_fields = ('order_number', 'placed_at')
    inlines = [OrderItemInline, StatusHistoryInline]
    date_hierarchy = 'placed_at'
