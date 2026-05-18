from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.conf import settings
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal
import hmac
import hashlib

# Safe Razorpay import — won't crash if not installed
try:
    import razorpay
    RAZORPAY_AVAILABLE = True
except ImportError:
    RAZORPAY_AVAILABLE = False
    razorpay = None

from .models import Order, OrderItem, OrderStatusHistory
from .serializers import OrderListSerializer, OrderDetailSerializer, PlaceOrderSerializer
from apps.menu.models import MenuItem, MenuItemVariant, MenuItemAddon
from apps.restaurants.models import Restaurant
from apps.restaurants.permissions import IsRestaurantOwner


def get_razorpay_client():
    """Get Razorpay client — raises clear error if not installed."""
    if not RAZORPAY_AVAILABLE:
        raise Exception(
            "razorpay package not installed. Run: pip install razorpay"
        )
    return razorpay.Client(
        auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
    )


class PlaceOrderView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = PlaceOrderSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        try:
            restaurant = Restaurant.objects.get(
                id=data['restaurant_id'], status='approved', is_open=True
            )
        except Restaurant.DoesNotExist:
            return Response({'error': 'Restaurant is not available.'}, status=400)

        subtotal = Decimal('0')
        order_items_data = []

        for item_data in data['items']:
            try:
                menu_item = MenuItem.objects.get(
                    id=item_data['menu_item_id'],
                    restaurant=restaurant,
                    is_available=True
                )
            except MenuItem.DoesNotExist:
                return Response({'error': 'Menu item not available.'}, status=400)

            unit_price = menu_item.price
            variant_name = ''
            if item_data.get('variant_id'):
                try:
                    v = MenuItemVariant.objects.get(
                        id=item_data['variant_id'], menu_item=menu_item
                    )
                    unit_price = v.price
                    variant_name = v.name
                except MenuItemVariant.DoesNotExist:
                    pass

            qty = item_data['quantity']
            item_total = unit_price * qty
            subtotal += item_total
            order_items_data.append({
                'menu_item': menu_item,
                'menu_item_name': menu_item.name,
                'variant_name': variant_name,
                'quantity': qty,
                'unit_price': unit_price,
                'total_price': item_total,
            })

        if subtotal < restaurant.min_order:
            return Response(
                {'error': f'Minimum order is ₹{restaurant.min_order}'}, status=400
            )

        delivery_fee = restaurant.delivery_fee
        tax = subtotal * Decimal('0.05')
        total = subtotal + delivery_fee + tax
        payment_method = data['payment_method']

        order = Order.objects.create(
            customer=request.user,
            restaurant=restaurant,
            delivery_address=data['delivery_address'],
            delivery_city=data['delivery_city'],
            delivery_pincode=data['delivery_pincode'],
            subtotal=subtotal,
            delivery_fee=delivery_fee,
            tax=tax,
            total=total,
            payment_method=payment_method,
            payment_status='pending',
            special_instructions=data.get('special_instructions', ''),
            estimated_delivery_time=timezone.now() + timedelta(
                minutes=restaurant.delivery_time
            )
        )

        for item in order_items_data:
            OrderItem.objects.create(order=order, **item)

        OrderStatusHistory.objects.create(
            order=order, status='pending',
            changed_by=request.user, note='Order placed'
        )
        restaurant.total_orders += 1
        restaurant.save(update_fields=['total_orders'])

        # COD — done
        if payment_method == 'cod':
            return Response({
                'message': 'Order placed!',
                'order_id': order.id,
                'order_number': order.order_number,
                'total': str(order.total),
            }, status=201)

        # Razorpay
        try:
            client = get_razorpay_client()
            amount_paise = int(total * 100)
            razorpay_order = client.order.create({
                'amount': amount_paise,
                'currency': 'INR',
                'payment_capture': 1,
                'notes': {
                    'order_id': str(order.id),
                    'customer': request.user.email,
                }
            })
            order.razorpay_order_id = razorpay_order['id']
            order.save(update_fields=['razorpay_order_id'])

            return Response({
                'order_id': order.id,
                'order_number': order.order_number,
                'razorpay_order_id': razorpay_order['id'],
                'amount': amount_paise,
                'key': settings.RAZORPAY_KEY_ID,
                'currency': 'INR',
                'customer_name': request.user.get_full_name(),
                'customer_email': request.user.email,
                'customer_phone': request.user.phone or '',
                'restaurant_name': restaurant.name,
            }, status=201)

        except Exception as e:
            order.delete()
            print(f'[Razorpay] Error: {e}')
            return Response(
                {'error': f'Payment gateway error: {str(e)}'},
                status=502
            )


class VerifyPaymentView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        order_id   = request.data.get('order_id')
        payment_id = request.data.get('payment_id')
        signature  = request.data.get('signature')

        if not all([order_id, payment_id, signature]):
            return Response({'error': 'Missing payment details.'}, status=400)

        try:
            order = Order.objects.get(id=order_id, customer=request.user)
        except Order.DoesNotExist:
            return Response({'error': 'Order not found.'}, status=404)

        try:
            msg = f"{order.razorpay_order_id}|{payment_id}"
            expected = hmac.new(
                settings.RAZORPAY_KEY_SECRET.encode('utf-8'),
                msg.encode('utf-8'),
                hashlib.sha256
            ).hexdigest()

            if not hmac.compare_digest(expected, signature):
                order.payment_status = 'failed'
                order.save(update_fields=['payment_status'])
                return Response({'error': 'Invalid payment signature.'}, status=400)

            order.payment_status = 'completed'
            order.payment_id = payment_id
            order.save(update_fields=['payment_status', 'payment_id'])

            OrderStatusHistory.objects.create(
                order=order, status=order.status, changed_by=request.user,
                note=f'Payment done. ID: {payment_id}'
            )
            return Response({
                'message': 'Payment verified!',
                'order_id': order.id,
                'order_number': order.order_number,
            })

        except Exception as e:
            order.payment_status = 'failed'
            order.save(update_fields=['payment_status'])
            return Response({'error': str(e)}, status=400)


class MyOrdersView(generics.ListAPIView):
    serializer_class = OrderListSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(
            customer=self.request.user
        ).order_by('-placed_at')


class OrderDetailView(generics.RetrieveAPIView):
    serializer_class = OrderDetailSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'restaurant_owner':
            return Order.objects.filter(restaurant__owner=user)
        elif user.role == 'delivery_partner':
            return Order.objects.filter(delivery_partner=user)
        return Order.objects.filter(customer=user)


class CancelOrderView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            order = Order.objects.get(pk=pk, customer=request.user)
            if order.status not in ['pending']:
                return Response(
                    {'error': 'Cannot cancel at this stage.'}, status=400
                )
            order.status = 'cancelled'
            order.save()
            OrderStatusHistory.objects.create(
                order=order, status='cancelled',
                changed_by=request.user, note='Cancelled by customer'
            )
            return Response({'message': 'Order cancelled.'})
        except Order.DoesNotExist:
            return Response({'error': 'Not found.'}, status=404)


class RestaurantOrdersView(generics.ListAPIView):
    serializer_class = OrderDetailSerializer
    permission_classes = [permissions.IsAuthenticated, IsRestaurantOwner]

    def get_queryset(self):
        status_filter = self.request.query_params.get('status')
        qs = Order.objects.filter(restaurant__owner=self.request.user)
        if status_filter:
            qs = qs.filter(status=status_filter)
        return qs.order_by('-placed_at')


class UpdateOrderStatusView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    RESTAURANT_TRANSITIONS = {
        'pending':   ['accepted', 'cancelled'],
        'accepted':  ['preparing', 'cancelled'],
        'preparing': ['ready'],
    }
    DELIVERY_TRANSITIONS = {
        'ready':     ['picked_up'],
        'picked_up': ['on_the_way'],
        'on_the_way':['delivered'],
    }

    def post(self, request, pk):
        new_status = request.data.get('status')
        note = request.data.get('note', '')
        user = request.user

        try:
            if user.role == 'restaurant_owner':
                order = Order.objects.get(pk=pk, restaurant__owner=user)
                allowed = self.RESTAURANT_TRANSITIONS.get(order.status, [])
            elif user.role == 'delivery_partner':
                order = Order.objects.get(pk=pk, delivery_partner=user)
                allowed = self.DELIVERY_TRANSITIONS.get(order.status, [])
            else:
                return Response({'error': 'Not authorized.'}, status=403)
        except Order.DoesNotExist:
            return Response({'error': 'Not found.'}, status=404)

        if new_status not in allowed:
            return Response({
                'error': f"Cannot go from '{order.status}' to '{new_status}'.",
                'allowed': allowed
            }, status=400)

        order.status = new_status
        now = timezone.now()
        if new_status == 'accepted':    order.accepted_at = now
        elif new_status == 'ready':     order.prepared_at = now
        elif new_status == 'picked_up': order.picked_up_at = now
        elif new_status == 'delivered':
            order.delivered_at = now
            if order.payment_method == 'cod':
                order.payment_status = 'completed'
        order.save()

        OrderStatusHistory.objects.create(
            order=order, status=new_status, changed_by=user, note=note
        )
        return Response({
            'message': f'Updated to {new_status}.',
            'status': order.status
        })


class AvailableDeliveriesView(generics.ListAPIView):
    serializer_class = OrderDetailSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role != 'delivery_partner':
            return Order.objects.none()
        return Order.objects.filter(
            status='ready', delivery_partner__isnull=True
        )


class AcceptDeliveryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        if request.user.role != 'delivery_partner':
            return Response({'error': 'Not a delivery partner.'}, status=403)
        try:
            order = Order.objects.get(
                pk=pk, status='ready', delivery_partner__isnull=True
            )
            order.delivery_partner = request.user
            order.save(update_fields=['delivery_partner'])
            return Response({
                'message': 'Accepted!',
                'order_number': order.order_number
            })
        except Order.DoesNotExist:
            return Response({'error': 'Not available.'}, status=404)


class MyDeliveriesView(generics.ListAPIView):
    serializer_class = OrderListSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(
            delivery_partner=self.request.user
        ).order_by('-placed_at')