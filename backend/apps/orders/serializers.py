"""Orders Serializers"""
from rest_framework import serializers
from django.utils import timezone
from datetime import timedelta
from .models import Order, OrderItem, OrderStatusHistory


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ('id', 'menu_item', 'menu_item_name', 'variant_name',
                  'quantity', 'unit_price', 'total_price', 'addons', 'special_note')


class OrderItemCreateSerializer(serializers.Serializer):
    """For creating order items during checkout."""
    menu_item_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1, max_value=20)
    variant_id = serializers.IntegerField(required=False, allow_null=True)
    addon_ids = serializers.ListField(child=serializers.IntegerField(), required=False)
    special_note = serializers.CharField(max_length=200, required=False, allow_blank=True)


class OrderStatusHistorySerializer(serializers.ModelSerializer):
    changed_by_name = serializers.CharField(source='changed_by.get_full_name', read_only=True)

    class Meta:
        model = OrderStatusHistory
        fields = ('status', 'changed_by_name', 'note', 'timestamp')


class OrderListSerializer(serializers.ModelSerializer):
    """Lightweight order list."""
    items_count = serializers.IntegerField(source='items.count', read_only=True)
    restaurant_name = serializers.CharField(source='restaurant.name', read_only=True)
    restaurant_logo = serializers.ImageField(source='restaurant.logo', read_only=True)

    class Meta:
        model = Order
        fields = ('id', 'order_number', 'restaurant_name', 'restaurant_logo',
                  'items_count', 'total', 'status', 'payment_method',
                  'placed_at', 'delivered_at')


class OrderDetailSerializer(serializers.ModelSerializer):
    """Full order details."""
    items = OrderItemSerializer(many=True, read_only=True)
    status_history = OrderStatusHistorySerializer(many=True, read_only=True)
    restaurant_name = serializers.CharField(source='restaurant.name', read_only=True)
    restaurant_logo = serializers.ImageField(source='restaurant.logo', read_only=True)
    restaurant_phone = serializers.CharField(source='restaurant.phone', read_only=True)
    delivery_partner_name = serializers.SerializerMethodField()
    delivery_partner_phone = serializers.SerializerMethodField()
    is_cancellable = serializers.BooleanField(read_only=True)
    is_trackable = serializers.BooleanField(read_only=True)

    class Meta:
        model = Order
        fields = '__all__'

    def get_delivery_partner_name(self, obj):
        return obj.delivery_partner.get_full_name() if obj.delivery_partner else None

    def get_delivery_partner_phone(self, obj):
        return obj.delivery_partner.phone if obj.delivery_partner else None


class PlaceOrderSerializer(serializers.Serializer):
    """Validate and process a new order."""
    restaurant_id = serializers.IntegerField()
    items = OrderItemCreateSerializer(many=True)
    delivery_address = serializers.CharField()
    delivery_city = serializers.CharField()
    delivery_pincode = serializers.CharField()
    payment_method = serializers.ChoiceField(choices=['cod', 'card', 'upi', 'wallet'])
    special_instructions = serializers.CharField(required=False, allow_blank=True)

    def validate_items(self, items):
        if not items:
            raise serializers.ValidationError("At least one item is required.")
        return items
