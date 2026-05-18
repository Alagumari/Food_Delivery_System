import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiMinus } from 'react-icons/fi';
import { addItem, removeItem, replaceCart, selectCartRestaurantId, selectItemQuantityInCart } from '../../store/slices/cartSlice';
import { FoodTypeBadge } from '../common/UI';
import toast from 'react-hot-toast';

const PLACEHOLDER_ITEM = 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=150&h=150&fit=crop';

export default function MenuItemCard({ item, restaurant }) {
  const [showConflictDialog, setShowConflictDialog] = useState(false);
  const dispatch = useDispatch();
  const cartRestaurantId = useSelector(selectCartRestaurantId);
  const quantity = useSelector(selectItemQuantityInCart(item.id));

  const cartPayload = {
    item: {
      id: item.id,
      name: item.name,
      price: parseFloat(item.price),
      image: item.image,
      variantId: null,
    },
    restaurantId: restaurant.id,
    restaurantName: restaurant.name,
    deliveryFee: parseFloat(restaurant.delivery_fee || 0),
    minOrder: parseFloat(restaurant.min_order || 0),
  };

  const handleAdd = () => {
    if (!item.is_available) return;

    if (cartRestaurantId && cartRestaurantId !== restaurant.id) {
      setShowConflictDialog(true);
      return;
    }
    dispatch(addItem(cartPayload));
    toast.success(`${item.name} added!`, { duration: 1500 });
  };

  const handleRemove = () => {
    dispatch(removeItem({ itemId: item.id, variantId: null }));
  };

  const handleReplaceCart = () => {
    dispatch(replaceCart(cartPayload));
    setShowConflictDialog(false);
    toast.success('Cart updated!');
  };

  return (
    <>
      <div className={`bg-white rounded-2xl p-4 shadow-card flex gap-4 ${!item.is_available ? 'opacity-60' : ''}`}>
        {/* Item Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <FoodTypeBadge type={item.food_type} />
            {item.is_bestseller && (
              <span className="text-xs bg-yellow-100 text-yellow-700 font-medium px-2 py-0.5 rounded">🔥 Bestseller</span>
            )}
            {!item.is_available && (
              <span className="text-xs bg-gray-100 text-gray-500 font-medium px-2 py-0.5 rounded">Unavailable</span>
            )}
          </div>

          <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">{item.name}</h3>

          {item.description && (
            <p className="text-xs text-gray-500 mb-2 line-clamp-2">{item.description}</p>
          )}

          <div className="flex items-center gap-3 text-xs text-gray-400">
            {item.calories && <span>🔥 {item.calories} cal</span>}
            {item.prep_time && <span>⏱ {item.prep_time} min</span>}
          </div>

          <div className="flex items-center justify-between mt-3">
            <span className="text-base font-bold text-gray-900">₹{item.price}</span>

            {/* Add/Remove Controls */}
            {quantity === 0 ? (
              <button
                onClick={handleAdd}
                disabled={!item.is_available}
                className="flex items-center gap-1 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all active:scale-95"
              >
                <FiPlus size={16} /> Add
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRemove}
                  className="w-8 h-8 rounded-xl bg-primary-100 hover:bg-primary-200 text-primary-600 flex items-center justify-center transition-colors"
                >
                  <FiMinus size={16} />
                </button>
                <motion.span
                  key={quantity}
                  initial={{ scale: 1.3 }}
                  animate={{ scale: 1 }}
                  className="w-6 text-center font-bold text-gray-900"
                >
                  {quantity}
                </motion.span>
                <button
                  onClick={handleAdd}
                  className="w-8 h-8 rounded-xl bg-primary-500 hover:bg-primary-600 text-white flex items-center justify-center transition-colors"
                >
                  <FiPlus size={16} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Item Image */}
        <div className="w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100">
          <img
            src={item.image ? `http://localhost:8000${item.image}` : PLACEHOLDER_ITEM}
            alt={item.name}
            className="w-full h-full object-cover"
            onError={(e) => { e.target.src = PLACEHOLDER_ITEM; }}
          />
        </div>
      </div>

      {/* Cart Conflict Dialog */}
      <AnimatePresence>
        {showConflictDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50"
              onClick={() => setShowConflictDialog(false)}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl"
            >
              <div className="text-center mb-5">
                <div className="text-5xl mb-3">🛒</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Start a new cart?</h3>
                <p className="text-gray-500 text-sm">
                  Your cart already has items from <strong>{cartRestaurantId && restaurant.name}</strong>. Adding this item will clear your current cart.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConflictDialog(false)}
                  className="flex-1 btn-secondary py-2.5 text-sm"
                >
                  Keep Current
                </button>
                <button
                  onClick={handleReplaceCart}
                  className="flex-1 btn-primary py-2.5 text-sm"
                >
                  Start New Cart
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
