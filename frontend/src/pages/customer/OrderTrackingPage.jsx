import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiPhone, FiMapPin, FiPackage, FiArrowLeft, FiX } from 'react-icons/fi';
import { ordersAPI, reviewsAPI } from '../../services/api';
import { OrderStatusBadge, LoadingSpinner } from '../../components/common/UI';
import toast from 'react-hot-toast';

const STATUS_STEPS = [
  { key: 'pending', label: 'Order Placed', icon: '📝', desc: 'Waiting for restaurant to accept' },
  { key: 'accepted', label: 'Accepted', icon: '✅', desc: 'Restaurant accepted your order' },
  { key: 'preparing', label: 'Preparing', icon: '👨‍🍳', desc: 'Your food is being cooked' },
  { key: 'ready', label: 'Ready', icon: '📦', desc: 'Food is packed and ready' },
  { key: 'picked_up', label: 'Picked Up', icon: '🚴', desc: 'Delivery partner picked up' },
  { key: 'on_the_way', label: 'On the Way', icon: '🛵', desc: 'Heading to your location' },
  { key: 'delivered', label: 'Delivered', icon: '🎉', desc: 'Enjoy your meal!' },
];

const STATUS_INDEX = Object.fromEntries(STATUS_STEPS.map((s, i) => [s.key, i]));

export default function OrderTrackingPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');

  const fetchOrder = useCallback(async () => {
    try {
      const res = await ordersAPI.getById(id);
      setOrder(res.data);
    } catch (err) {
      toast.error('Could not fetch order details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const handleCancel = async () => {
    if (!window.confirm('Cancel this order?')) return;

    try {
      await ordersAPI.cancel(id);
      toast.success('Order cancelled');
      fetchOrder();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Cannot cancel order');
    }
  };

  const handleSubmitReview = async () => {
    if (!rating) {
      toast.error('Please select a rating');
      return;
    }

    try {
      await reviewsAPI.create({
        order: order.id,
        restaurant: order.restaurant || order.restaurant_id,
        rating: rating,
        comment: review,
      });

      toast.success('Review submitted successfully!');
      setRating(0);
      setReview('');
    } catch (err) {
      console.error(err.response?.data);
      toast.error('Failed to submit review');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container-page py-16 text-center">
        <p className="text-gray-500">Order not found.</p>
      </div>
    );
  }

  const currentStepIndex =
    order.status === 'cancelled' ? -1 : (STATUS_INDEX[order.status] ?? 0);

  return (
    <div className="container-page py-8 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link to="/orders" className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
          <FiArrowLeft size={20} />
        </Link>

        <div>
          <h1 className="section-title">Track Order</h1>
          <p className="text-sm text-gray-500">#{order.order_number}</p>
        </div>

        <div className="ml-auto">
          <OrderStatusBadge status={order.status} />
        </div>
      </div>

      {/* Progress */}
      {order.status !== 'cancelled' && (
        <div className="bg-white rounded-2xl shadow-card p-6 mb-5">
          <h2 className="font-semibold text-gray-900 mb-5">Order Progress</h2>

          <div className="space-y-1">
            {STATUS_STEPS.map((step, index) => {
              const isCompleted = index < currentStepIndex;
              const isCurrent = index === currentStepIndex;

              return (
                <div key={step.key} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <motion.div
                      initial={false}
                      animate={{
                        backgroundColor: isCompleted ? '#22c55e' : isCurrent ? '#f97316' : '#e5e7eb',
                      }}
                      className="w-9 h-9 rounded-full flex items-center justify-center text-lg"
                    >
                      {isCompleted ? '✓' : step.icon}
                    </motion.div>
                    {index < STATUS_STEPS.length - 1 && (
                      <div className={`w-0.5 h-8 mt-1 ${isCompleted ? 'bg-green-400' : 'bg-gray-200'}`} />
                    )}
                  </div>

                  <div className="pb-6">
                    <p className="font-semibold text-sm">{step.label}</p>
                    <p className="text-xs text-gray-400">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Order Items */}
      <div className="bg-white rounded-2xl shadow-card p-6 mb-5">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FiPackage size={18} />
          Order Items
        </h3>

        <div className="space-y-2">
          {order.items?.map((item) => (
            <div key={item.id} className="flex justify-between text-sm text-gray-600">
              <span>{item.quantity}x {item.menu_item_name}</span>
              <span>₹{item.total_price}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Rating */}
      {order.status === 'delivered' && (
        <div className="bg-white rounded-2xl shadow-card p-6 mb-5">
          <h3 className="font-semibold text-gray-900 mb-4">Rate Your Order</h3>

          <div className="flex gap-2 mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className={`text-3xl ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
              >
                ★
              </button>
            ))}
          </div>

          <textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="Write your review..."
            rows="4"
            className="w-full border rounded-xl p-3 mb-4"
          />

          <button
            onClick={handleSubmitReview}
            className="bg-orange-500 text-white px-6 py-3 rounded-xl"
          >
            Submit Review
          </button>
        </div>
      )}

      {/* Cancel */}
      {order.is_cancellable && (
        <button
          onClick={handleCancel}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-red-200 text-red-600"
        >
          <FiX size={18} />
          Cancel Order
        </button>
      )}
    </div>
  );
}