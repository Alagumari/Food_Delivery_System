from rest_framework import serializers
from .models import Restaurant, RestaurantCategory, BusinessHours


class CategorySerializer(serializers.ModelSerializer):
    restaurant_count = serializers.SerializerMethodField()

    class Meta:
        model = RestaurantCategory
        fields = ('id', 'name', 'icon', 'image', 'restaurant_count')

    def get_restaurant_count(self, obj):
        return obj.restaurants.filter(status='approved').count()


class BusinessHoursSerializer(serializers.ModelSerializer):
    day_name = serializers.CharField(source='get_day_display', read_only=True)

    class Meta:
        model = BusinessHours
        fields = ('id', 'day', 'day_name', 'open_time', 'close_time', 'is_closed')


class RestaurantListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list views."""
    cuisine_types = CategorySerializer(many=True, read_only=True)
    is_favourite = serializers.SerializerMethodField()

    class Meta:
        model = Restaurant
        fields = ('id', 'name', 'description', 'cuisine_types', 'logo',
                  'cover_image', 'city', 'rating', 'total_reviews',
                  'delivery_time', 'delivery_fee', 'min_order', 'price_range',
                  'is_open', 'is_featured', 'is_favourite')

    def get_is_favourite(self, obj):
        return False


class RestaurantDetailSerializer(serializers.ModelSerializer):
    """Full restaurant details including hours."""
    cuisine_types = CategorySerializer(many=True, read_only=True)
    business_hours = BusinessHoursSerializer(many=True, read_only=True)
    owner_name = serializers.CharField(source='owner.get_full_name', read_only=True)

    class Meta:
        model = Restaurant
        fields = ('id', 'name', 'description', 'cuisine_types', 'phone', 'email',
                  'address', 'city', 'state', 'pincode', 'latitude', 'longitude',
                  'logo', 'cover_image', 'min_order', 'delivery_time', 'delivery_fee',
                  'price_range', 'rating', 'total_reviews', 'total_orders',
                  'is_open', 'is_featured', 'business_hours', 'owner_name',
                  'created_at')


class RestaurantCreateUpdateSerializer(serializers.ModelSerializer):
    """For restaurant owners to create/update their restaurant."""
    cuisine_type_ids = serializers.ListField(
        child=serializers.IntegerField(), write_only=True, required=False
    )

    class Meta:
        model = Restaurant
        fields = ('name', 'description', 'phone', 'email', 'address', 'city',
                  'state', 'pincode', 'logo', 'cover_image', 'min_order',
                  'delivery_time', 'delivery_fee', 'price_range',
                  'is_open', 'cuisine_type_ids')

    def create(self, validated_data):
        cuisine_ids = validated_data.pop('cuisine_type_ids', [])
        validated_data['owner'] = self.context['request'].user
        restaurant = Restaurant.objects.create(**validated_data)
        if cuisine_ids:
            restaurant.cuisine_types.set(cuisine_ids)
        return restaurant

    def update(self, instance, validated_data):
        cuisine_ids = validated_data.pop('cuisine_type_ids', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if cuisine_ids is not None:
            instance.cuisine_types.set(cuisine_ids)
        return instance
