from django.contrib import admin
from .models import Restaurant, RestaurantCategory, BusinessHours


@admin.register(RestaurantCategory)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'icon', 'is_active')
    list_editable = ('is_active',)


@admin.register(Restaurant)
class RestaurantAdmin(admin.ModelAdmin):
    list_display = ('name', 'owner', 'city', 'status', 'is_open', 'rating', 'total_orders', 'total_reviews', 'is_featured')
    list_filter = ('status', 'is_open', 'is_featured', 'city')
    search_fields = ('name', 'city', 'owner__email')
    list_editable = ('status', 'is_open', 'is_featured')
    readonly_fields = ('total_orders', 'total_reviews', 'rating')
    actions = ['approve_restaurants', 'suspend_restaurants']

    def approve_restaurants(self, request, queryset):
        queryset.update(status='approved')
        self.message_user(request, f'{queryset.count()} restaurants approved.')

    approve_restaurants.short_description = 'Approve selected restaurants'

    def suspend_restaurants(self, request, queryset):
        queryset.update(status='suspended')

    suspend_restaurants.short_description = 'Suspend selected restaurants'


@admin.register(BusinessHours)
class BusinessHoursAdmin(admin.ModelAdmin):
    list_display = ('restaurant', 'day', 'open_time', 'close_time', 'is_closed')