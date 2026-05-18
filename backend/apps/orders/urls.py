from django.urls import path
from .views import (
    PlaceOrderView, VerifyPaymentView, MyOrdersView, OrderDetailView,
    CancelOrderView, RestaurantOrdersView, UpdateOrderStatusView,
    AvailableDeliveriesView, AcceptDeliveryView, MyDeliveriesView
)

urlpatterns = [
    path('create/', PlaceOrderView.as_view()),
    path('verify-payment/', VerifyPaymentView.as_view()),

    path('my/', MyOrdersView.as_view()),
    path('<int:pk>/', OrderDetailView.as_view()),
    path('<int:pk>/cancel/', CancelOrderView.as_view()),
    path('orders/verify-payment/', VerifyPaymentView.as_view()),
    path('restaurant/', RestaurantOrdersView.as_view()),
    path('<int:pk>/status/', UpdateOrderStatusView.as_view()),

    path('available/', AvailableDeliveriesView.as_view()),
    path('<int:pk>/accept-delivery/', AcceptDeliveryView.as_view()),
    path('my-deliveries/', MyDeliveriesView.as_view()),
    
  
]