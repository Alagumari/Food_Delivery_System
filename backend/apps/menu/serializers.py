"""Menu Serializers"""
from rest_framework import serializers
from .models import MenuCategory, MenuItem, MenuItemVariant, MenuItemAddon


class MenuItemVariantSerializer(serializers.ModelSerializer):
    class Meta:
        model = MenuItemVariant
        fields = ('id', 'name', 'price', 'is_default')


class MenuItemAddonSerializer(serializers.ModelSerializer):
    class Meta:
        model = MenuItemAddon
        fields = ('id', 'name', 'price', 'is_available')


class MenuItemSerializer(serializers.ModelSerializer):
    variants = MenuItemVariantSerializer(many=True, read_only=True)
    addons = MenuItemAddonSerializer(many=True, read_only=True)
    food_type_display = serializers.CharField(source='get_food_type_display', read_only=True)

    class Meta:
        model = MenuItem
        fields = ('id', 'name', 'description', 'price', 'image', 'food_type',
                  'food_type_display', 'is_bestseller', 'is_available', 'is_customizable',
                  'calories', 'prep_time', 'rating', 'total_orders', 'variants', 'addons',
                  'category', 'sort_order')


class MenuItemCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = MenuItem
        fields = ('name', 'description', 'price', 'image', 'food_type', 'category',
                  'is_bestseller', 'is_available', 'is_customizable', 'calories', 'prep_time')

    def create(self, validated_data):
        restaurant = self.context['request'].user.restaurant
        return MenuItem.objects.create(restaurant=restaurant, **validated_data)


class MenuCategorySerializer(serializers.ModelSerializer):
    items = MenuItemSerializer(many=True, read_only=True)
    item_count = serializers.IntegerField(source='items.count', read_only=True)

    class Meta:
        model = MenuCategory
        fields = ('id', 'name', 'description', 'sort_order', 'is_active', 'items', 'item_count')
