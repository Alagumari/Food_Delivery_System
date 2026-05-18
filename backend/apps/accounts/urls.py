from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView, LoginView, ProfileView,
    AddressListCreateView, AddressDetailView, SetDefaultAddressView
)

urlpatterns = [
    # Authentication
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Profile
    path('profile/', ProfileView.as_view(), name='profile'),

    # Addresses
    path('addresses/', AddressListCreateView.as_view(), name='address_list'),
    path('addresses/<int:pk>/', AddressDetailView.as_view(), name='address_detail'),
    path('addresses/<int:pk>/set-default/', SetDefaultAddressView.as_view(), name='address_set_default'),
]
