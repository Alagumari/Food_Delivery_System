"""
FoodRush URL Configuration
All API routes for the food delivery platform
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),

    # Authentication & User Management
    path('api/auth/', include('apps.accounts.urls')),

    # Restaurant Management
    path('api/restaurants/', include('apps.restaurants.urls')),

    # Menu Management
    path('api/menu/', include('apps.menu.urls')),

    # Order Management
    path('api/orders/', include('apps.orders.urls')),

    # Delivery Management
    path('api/delivery/', include('apps.delivery.urls')),

    # Reviews
    path('api/reviews/', include('apps.reviews.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
