import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMinus, FiPlus, FiTrash2, FiArrowLeft, FiShoppingBag } from 'react-icons/fi';
import {
  selectCartItems, selectCartSubtotal, selectCartDeliveryFee,
  selectCartMinOrder, selectCartRestaurantName, selectCartRestaurantId,
  addItem, removeItem, deleteItem, clearCart
} from '../../store/slices/cartSlice';
import { EmptyState } from '../../components/common/UI';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=80&h=80&fit=crop';

export default function CartPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const items = useSelector(selectCartItems);
  const subtotal = useSelector(selectCartSubtotal);
  const deliveryFee = useSelector(selectCartDeliveryFee);
  const minOrder = useSelector(selectCartMinOrder);
  const restaurantName = useSelector(selectCartRestaurantName);
  const restaurantId = useSelector(selectCartRestaurantId);

  const TAX_RATE = 0.05;
  const tax = subtotal * TAX_RATE;
  const total = subtotal + deliveryFee + tax;
  const meetsMinOrder = subtotal >= minOrder;

  if (items.length === 0) {
    return (
      <div className="container-page py-16">
        <EmptyState
          icon="🛒"
          title="Your cart is empty"
          subtitle="Add delicious items from a restaurant to get started"
          action={
            <Link to="/restaurants" className="btn-primary">
              Browse Restaurants
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="container-page py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
          <FiArrowLeft size={20} />
        </button>
        <div>
          <h1 className="section-title">Your Cart</h1>
          <p className="text-sm text-gray-500">from <span className="font-medium text-gray-700">{restaurantName}</span></p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-3">
          <AnimatePresence>
            {items.map((item) => (
              <motion.div
                key={`${item.id}-${item.variantId}`}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -30, height: 0 }}
                className="bg-white rounded-2xl p-4 shadow-card flex gap-4 items-center"
              >
                <img
                  src={item.image ? `http://localhost:8000${item.image}` : PLACEHOLDER}
                  alt={item.name}
                  className="w-20 h-20 rounded-xl object-cover flex-shrink-0 bg-gray-100"
                  onError={(e) => { e.target.src = PLACEHOLDER; }}
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{item.name}</h3>
                  {item.variantName && <p className="text-xs text-gray-400">{item.variantName}</p>}
                  <p className="text-primary-500 font-bold mt-1">₹{item.price.toFixed(2)}</p>
                </div>
                <div className="flex flex-col items-end gap-3">
                  <button
                    onClick={() => dispatch(deleteItem({ itemId: item.id, variantId: item.variantId }))}
                    className="text-gray-300 hover:text-red-500 transition-colors"
                  >
                    <FiTrash2 size={16} />
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => dispatch(removeItem({ itemId: item.id, variantId: item.variantId }))}
                      className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-red-100 text-gray-700 hover:text-red-600 flex items-center justify-center transition-colors"
                    >
                      <FiMinus size={14} />
                    </button>
                    <motion.span
                      key={item.quantity}
                      initial={{ scale: 1.3 }}
                      animate={{ scale: 1 }}
                      className="w-6 text-center font-bold"
                    >
                      {item.quantity}
                    </motion.span>
                    <button
                      onClick={() => dispatch(addItem({
                        item: { id: item.id, name: item.name, price: item.price, image: item.image, variantId: item.variantId },
                        restaurantId,
                        restaurantName,
                        deliveryFee,
                        minOrder,
                      }))}
                      className="w-8 h-8 rounded-xl bg-primary-500 hover:bg-primary-600 text-white flex items-center justify-center transition-colors"
                    >
                      <FiPlus size={14} />
                    </button>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">₹{(item.price * item.quantity).toFixed(2)}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          <div className="flex justify-between items-center pt-2">
            <Link to={`/restaurant/${restaurantId}`} className="text-primary-500 text-sm font-medium hover:underline flex items-center gap-1">
              <FiShoppingBag size={14} /> Add more items
            </Link>
            <button
              onClick={() => dispatch(clearCart())}
              className="text-sm text-red-500 hover:underline flex items-center gap-1"
            >
              <FiTrash2 size={14} /> Clear cart
            </button>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-card p-6 sticky top-24">
            <h2 className="font-semibold text-gray-900 mb-4">Order Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery fee</span>
                <span className={deliveryFee === 0 ? 'text-green-600 font-medium' : ''}>
                  {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>GST (5%)</span>
                <span>₹{tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 text-base pt-3 border-t border-gray-100">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>

            {!meetsMinOrder && minOrder > 0 && (
              <p className="mt-3 text-xs text-amber-600 bg-amber-50 rounded-xl p-3">
                Minimum order is ₹{minOrder}. Add ₹{(minOrder - subtotal).toFixed(0)} more.
              </p>
            )}

            <button
              onClick={() => navigate('/checkout')}
              disabled={!meetsMinOrder}
              className="btn-primary w-full mt-4 disabled:opacity-50"
            >
              Proceed to Checkout →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
