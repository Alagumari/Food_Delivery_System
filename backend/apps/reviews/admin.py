from django.contrib import admin
from .models import Review


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('customer', 'restaurant', 'rating', 'is_visible', 'created_at')
    list_filter = ('rating', 'is_visible')
    search_fields = ('customer__email', 'restaurant__name')
    list_editable = ('is_visible',)
