import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiStar, FiClock, FiTruck, FiPhone, FiMapPin, FiSearch } from 'react-icons/fi';
import { restaurantAPI, menuAPI, reviewsAPI } from '../../services/api';
import { LoadingSpinner } from '../../components/common/UI';
import MenuItemCard from '../../components/customer/MenuItemCard';
import CartSidebar from '../../components/customer/CartSidebar';
import { useSelector } from 'react-redux';
import { selectCartRestaurantId, selectCartItemCount } from '../../store/slices/cartSlice';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=300&fit=crop';

export default function RestaurantDetailPage() {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [menu, setMenu] = useState({ categories: [], uncategorized: [] });
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(null);
  const [menuSearch, setMenuSearch] = useState('');
  const [showCart, setShowCart] = useState(false);
  const cartRestaurantId = useSelector(selectCartRestaurantId);
  const cartCount = useSelector(selectCartItemCount);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [rRes, mRes, revRes] = await Promise.all([
          restaurantAPI.getById(id),
          menuAPI.getRestaurantMenu(id),
          reviewsAPI.getRestaurantReviews(id),
        ]);

        setRestaurant(rRes.data);
        setMenu(mRes.data);
        setReviews(revRes.data.results || revRes.data);

        if (mRes.data.categories?.length > 0) {
          setActiveCategory(mRes.data.categories[0].id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" /></div>;
  if (!restaurant) return <div className="container-page py-16 text-center"><p>Restaurant not found.</p></div>;

  const filterItems = (items) => {
    if (!menuSearch) return items;
    return items.filter((item) =>
      item.name.toLowerCase().includes(menuSearch.toLowerCase()) ||
      item.description?.toLowerCase().includes(menuSearch.toLowerCase())
    );
  };

  const allCategories = menu.categories || [];
  const activeItems = activeCategory
    ? allCategories.find((c) => c.id === activeCategory)?.items || []
    : menu.uncategorized || [];

  const filteredItems = filterItems(activeItems);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="relative h-56 md:h-72 bg-gray-300 overflow-hidden">
        <img
          src={restaurant.cover_image ? `http://localhost:8000${restaurant.cover_image}` : PLACEHOLDER}
          alt={restaurant.name}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="container-page">
        <div className="bg-white rounded-2xl shadow-card -mt-12 relative z-10 p-6 mb-6">
          <h1 className="text-2xl font-bold">{restaurant.name}</h1>
          <p className="text-gray-500">{restaurant.cuisine_types?.map((c) => c.name).join(' • ')}</p>
        </div>

        <div className="flex gap-6 pb-16">
          <div className="flex-1 min-w-0">
            <div className="relative mb-4">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                value={menuSearch}
                onChange={(e) => setMenuSearch(e.target.value)}
                placeholder="Search menu items..."
                className="input-field pl-10 text-sm"
              />
            </div>

            {allCategories.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-3 mb-6">
                {allCategories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => { setActiveCategory(cat.id); setMenuSearch(''); }}
                    className={`px-4 py-2 rounded-xl text-sm ${activeCategory === cat.id ? 'bg-primary-500 text-white' : 'bg-white text-gray-600'}`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            )}

            <div className="space-y-3">
              {filteredItems.map((item, i) => (
                <motion.div key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
                  <MenuItemCard item={item} restaurant={restaurant} />
                </motion.div>
              ))}
            </div>

            <div className="mt-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Customer Reviews</h2>
              {reviews.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-card p-6 text-center text-gray-500">No reviews yet.</div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="bg-white rounded-2xl shadow-card p-5">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-800">{review.customer_name || 'Customer'}</h4>
                        <div className="flex items-center gap-1 text-yellow-500">
                          <FiStar className="fill-yellow-400" />
                          <span>{review.rating}</span>
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm mb-2">{review.comment}</p>
                      <p className="text-xs text-gray-400 mb-3">{new Date(review.created_at).toLocaleDateString('en-IN')}</p>
                      {review.owner_reply && (
                        <div className="bg-orange-50 border-l-4 border-orange-400 p-3 rounded-lg">
                          <p className="text-sm font-semibold text-orange-600 mb-1">Restaurant Reply</p>
                          <p className="text-sm text-gray-700">{review.owner_reply}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-24">
              <CartSidebar restaurantId={parseInt(id)} restaurantName={restaurant.name} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
