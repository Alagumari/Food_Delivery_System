import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMinus, FiPlus, FiTrash2, FiShoppingCart } from 'react-icons/fi';
import {
  selectCartItems, selectCartSubtotal, selectCartDeliveryFee,
  selectCartMinOrder, selectCartRestaurantName, addItem, removeItem, deleteItem
} from '../../store/slices/cartSlice';
import { selectIsAuthenticated } from '../../store/slices/authSlice';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=60&h=60&fit=crop';

export default function CartSidebar({ restaurantId, restaurantName: propName }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const items = useSelector(selectCartItems);
  const subtotal = useSelector(selectCartSubtotal);
  const deliveryFee = useSelector(selectCartDeliveryFee);
  const minOrder = useSelector(selectCartMinOrder);
  const storeRestaurantName = useSelector(selectCartRestaurantName);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const TAX_RATE = 0.05;
  const tax = subtotal * TAX_RATE;
  const total = subtotal + deliveryFee + tax;
  const meetsMinOrder = subtotal >= minOrder;
  const restaurantName = propName || storeRestaurantName;

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/checkout' } } });
    } else {
      navigate('/checkout');
    }
  };

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-card p-6 text-center">
        <FiShoppingCart size={40} className="text-gray-300 mx-auto mb-3" />
        <h3 className="font-semibold text-gray-700 mb-1">Your cart is empty</h3>
        <p className="text-sm text-gray-400">Add items to get started</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-card overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100">
        <h3 className="font-semibold text-gray-900">Your Order</h3>
        {restaurantName && (
          <p className="text-xs text-gray-400 mt-0.5">from {restaurantName}</p>
        )}
      </div>

      {/* Items */}
      <div className="px-4 py-3 max-h-64 overflow-y-auto space-y-3">
        <AnimatePresence>
          {items.map((item) => (
            <motion.div
              key={`${item.id}-${item.variantId}`}
              layout
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex items-center gap-3"
            >
              <img
                src={item.image ? `http://localhost:8000${item.image}` : PLACEHOLDER}
                alt={item.name}
                className="w-12 h-12 rounded-lg object-cover flex-shrink-0 bg-gray-100"
                onError={(e) => { e.target.src = PLACEHOLDER; }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 line-clamp-1">{item.name}</p>
                {item.variantName && (
                  <p className="text-xs text-gray-400">{item.variantName}</p>
                )}
                <p className="text-sm font-semibold text-primary-500">₹{(item.price * item.quantity).toFixed(2)}</p>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => dispatch(removeItem({ itemId: item.id, variantId: item.variantId }))}
                  className="w-6 h-6 rounded-lg bg-gray-100 hover:bg-red-100 text-gray-600 hover:text-red-600 flex items-center justify-center transition-colors"
                >
                  {item.quantity === 1 ? <FiTrash2 size={12} /> : <FiMinus size={12} />}
                </button>
                <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                <button
                  onClick={() => dispatch(addItem({
                    item: { id: item.id, name: item.name, price: item.price, image: item.image, variantId: item.variantId },
                    restaurantId,
                    restaurantName,
                    deliveryFee,
                    minOrder,
                  }))}
                  className="w-6 h-6 rounded-lg bg-primary-500 hover:bg-primary-600 text-white flex items-center justify-center transition-colors"
                >
                  <FiPlus size={12} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Min order warning */}
      {!meetsMinOrder && minOrder > 0 && (
        <div className="mx-4 mb-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-xs text-amber-700">
          Add ₹{(minOrder - subtotal).toFixed(0)} more to meet minimum order of ₹{minOrder}
        </div>
      )}

      {/* Bill Summary */}
      <div className="px-5 py-4 border-t border-gray-100 space-y-2 text-sm">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Delivery fee</span>
          <span className={deliveryFee === 0 ? 'text-green-600 font-medium' : ''}>
            {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee.toFixed(2)}`}
          </span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>GST (5%)</span><span>₹{tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-bold text-gray-900 text-base pt-2 border-t border-gray-100">
          <span>Total</span><span>₹{total.toFixed(2)}</span>
        </div>
      </div>

      {/* Checkout Button */}
      <div className="px-4 pb-4">
        <button
          onClick={handleCheckout}
          disabled={!meetsMinOrder}
          className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isAuthenticated ? 'Proceed to Checkout' : 'Login to Checkout'}
        </button>
      </div>
    </div>
  );
}
