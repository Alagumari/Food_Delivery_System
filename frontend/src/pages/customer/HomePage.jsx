import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiSearch, FiArrowRight, FiClock, FiStar, FiShield } from 'react-icons/fi';
import { restaurantAPI } from '../../services/api';
import RestaurantCard from '../../components/customer/RestaurantCard';
import { SkeletonCard } from '../../components/common/UI';

const HERO_FOODS = ['🍕', '🍔', '🌮', '🍜', '🍣', '🥗', '🍛', '🥙'];

const FEATURES = [
  { icon: <FiClock size={24} />, title: 'Fast Delivery', desc: '30 minutes or less', color: 'bg-orange-100 text-orange-600' },
  { icon: <FiStar size={24} />, title: 'Top Rated', desc: 'Only the best restaurants', color: 'bg-yellow-100 text-yellow-600' },
  { icon: <FiShield size={24} />, title: 'Safe & Secure', desc: 'Hygienic food guarantee', color: 'bg-green-100 text-green-600' },
];

export default function HomePage() {
  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, featRes] = await Promise.all([
          restaurantAPI.getCategories(),
          restaurantAPI.getAll({ is_featured: true }),
        ]);
        setCategories(catRes.data.results || catRes.data);
        setFeatured(featRes.data.results || featRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/restaurants?search=${search}`);
  };

  return (
    <div>
      {/* ===================== HERO ===================== */}
      <section className="bg-gradient-to-br from-primary-500 via-primary-600 to-orange-600 text-white overflow-hidden relative">
        <div className="container-page py-16 md:py-24 relative z-10">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <motion.span
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-block bg-white/20 backdrop-blur-sm text-white text-sm font-medium px-4 py-1.5 rounded-full mb-4"
              >
                🎉 Free delivery on first order!
              </motion.span>
              <h1 className="font-display font-bold text-4xl md:text-5xl lg:text-6xl leading-tight mb-4">
                Hungry?<br />
                <span className="text-yellow-300">Order In</span> Minutes!
              </h1>
              <p className="text-white/85 text-lg mb-8 max-w-md">
                Discover 500+ restaurants near you. Fresh, hot food delivered to your doorstep in 30 minutes or less.
              </p>

              {/* Search Bar */}
              <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
                <div className="relative flex-1">
                  <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search restaurants or cuisines..."
                    className="w-full pl-11 pr-4 py-4 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow-lg"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold px-6 py-4 rounded-xl transition-colors shadow-lg whitespace-nowrap"
                >
                  Search
                </button>
              </form>

              {/* <div className="flex flex-wrap gap-4 mt-6 text-sm text-white/80">
                <span>🔥 Trending:</span>
                {['Pizza', 'Biryani', 'Burger', 'Sushi'].map((t) => (
                  <button
                    key={t}
                    onClick={() => navigate(`/restaurants?search=${t}`)}
                    className="hover:text-yellow-300 transition-colors underline underline-offset-2"
                  >
                    {t}
                  </button>
                ))}
              </div> */}
            </motion.div>

            {/* Floating food emojis */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="hidden md:flex justify-center"
            >
              <div className="relative w-72 h-72">
                
                <div className="absolute inset-0 flex items-center justify-center text-8xl animate-bounce-gentle">
                  🍔
                </div>
                {HERO_FOODS.map((food, i) => {
                  const angle = (i * 360) / HERO_FOODS.length;
                  const rad = (angle * Math.PI) / 180;
                  const x = 50 + 42 * Math.cos(rad);
                  const y = 50 + 42 * Math.sin(rad);
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 + i * 0.08 }}
                      style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}
                      className="absolute text-3xl"
                    >
                      {food}
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,60 C360,0 1080,0 1440,60 L1440,60 L0,60 Z" fill="#f9fafb" />
          </svg>
        </div>
      </section>

      {/* ===================== FEATURES ===================== */}
      <section className="container-page py-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-4 bg-white rounded-2xl p-5 shadow-card"
            >
              <div className={`w-12 h-12 rounded-xl ${f.color} flex items-center justify-center flex-shrink-0`}>
                {f.icon}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{f.title}</h3>
                <p className="text-sm text-gray-500">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ===================== CATEGORIES ===================== */}
      <section className="container-page pb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="section-title">Browse by Cuisine</h2>
          <Link to="/restaurants" className="text-primary-500 font-medium hover:underline flex items-center gap-1 text-sm">
            See all <FiArrowRight size={16} />
          </Link>
        </div>

        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
          <button
            onClick={() => navigate('/restaurants')}
            className="flex-shrink-0 flex flex-col items-center gap-2 p-4 bg-primary-500 text-white rounded-2xl w-20 hover:bg-primary-600 transition-colors"
          >
            <span className="text-2xl">🍽️</span>
            <span className="text-xs font-medium">All</span>
          </button>
          {categories.slice(0, 10).map((cat, i) => (
            <motion.button
              key={cat.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              onClick={() => navigate(`/restaurants?cuisine=${cat.id}`)}
              className="flex-shrink-0 flex flex-col items-center gap-2 p-4 bg-white rounded-2xl w-20 hover:shadow-card-hover hover:-translate-y-1 transition-all shadow-card"
            >
              <span className="text-2xl">{cat.icon || '🍴'}</span>
              <span className="text-xs font-medium text-gray-700 text-center leading-tight">{cat.name}</span>
            </motion.button>
          ))}
        </div>
      </section>

      {/* ===================== FEATURED RESTAURANTS ===================== */}
      <section className="container-page pb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="section-title">🌟 Featured Restaurants</h2>
          <Link to="/restaurants" className="text-primary-500 font-medium hover:underline flex items-center gap-1 text-sm">
            View all <FiArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : featured.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-4xl mb-3">🏪</p>
            <p className="font-medium">No restaurants available yet.</p>
            <p className="text-sm">Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {featured.map((restaurant, i) => (
              <motion.div
                key={restaurant.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <RestaurantCard restaurant={restaurant} />
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* ===================== CTA BANNER ===================== */}
      <section className="bg-gray-900 text-white py-16">
        <div className="container-page text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display font-bold text-3xl md:text-4xl mb-4">
              Own a restaurant? 🍕
            </h2>
            <p className="text-gray-400 text-lg mb-8 max-w-md mx-auto">
              Partner with FoodRush and reach thousands of hungry customers in your area.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/register" className="btn-primary">
                Add Your Restaurant
              </Link>
              <Link to="/register" className="btn-secondary">
                Become a Delivery Partner
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
