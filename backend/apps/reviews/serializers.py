"""Reviews Serializers"""
from rest_framework import serializers
from .models import Review


class ReviewSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.get_full_name', read_only=True)
    customer_avatar = serializers.ImageField(source='customer.profile_picture', read_only=True)

    class Meta:
        model = Review
        fields = ('id', 'customer_name', 'customer_avatar', 'rating',
                  'comment', 'owner_reply', 'created_at')
        read_only_fields = ('id', 'customer_name', 'customer_avatar', 'owner_reply', 'created_at')


class CreateReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ('restaurant', 'order', 'rating', 'comment')

    def create(self, validated_data):
        validated_data['customer'] = self.context['request'].user
        return super().create(validated_data)

    def validate(self, attrs):
        request = self.context['request']
        restaurant = attrs.get('restaurant')
        if Review.objects.filter(customer=request.user, restaurant=restaurant).exists():
            raise serializers.ValidationError('You have already reviewed this restaurant.')
        return attrs
