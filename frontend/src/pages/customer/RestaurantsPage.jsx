import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiSearch, FiFilter, FiX } from 'react-icons/fi';
import { restaurantAPI } from '../../services/api';
import RestaurantCard from '../../components/customer/RestaurantCard';
import { SkeletonCard, EmptyState } from '../../components/common/UI';

const SORT_OPTIONS = [
  { value: '-rating', label: '⭐ Top Rated' },
  { value: 'delivery_time', label: '⚡ Fastest' },
  { value: 'delivery_fee', label: '🆓 Free Delivery' },
  { value: '-created_at', label: '🆕 Newest' },
];

const PRICE_OPTIONS = [
  { value: '', label: 'Any' },
  { value: '$', label: '$ Budget' },
  { value: '$$', label: '$$ Moderate' },
  { value: '$$$', label: '$$$ Premium' },
];

export default function RestaurantsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [restaurants, setRestaurants] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    cuisine: searchParams.get('cuisine') || '',
    ordering: '-rating',
    is_open: '',
    price_range: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  const fetchRestaurants = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.cuisine) params.cuisine = filters.cuisine;
      if (filters.ordering) params.ordering = filters.ordering;
      if (filters.is_open) params.is_open = true;
      if (filters.price_range) params.price_range = filters.price_range;

      const res = await restaurantAPI.getAll(params);
      const data = res.data;
      setRestaurants(data.results || data);
      setTotalCount(data.count || (data.results || data).length);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchRestaurants();
  }, [fetchRestaurants]);

  useEffect(() => {
    restaurantAPI.getCategories().then((res) => {
      setCategories(res.data.results || res.data);
    });
  }, []);

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({ search: '', cuisine: '', ordering: '-rating', is_open: '', price_range: '' });
    setSearchParams({});
  };

  const hasActiveFilters = filters.search || filters.cuisine || filters.is_open || filters.price_range;

  return (
    <div className="container-page py-8">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="section-title mb-1">All Restaurants</h1>
        {!loading && (
          <p className="text-gray-500 text-sm">{totalCount} restaurants found</p>
        )}
      </div>

      {/* Search + Filter Bar */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            placeholder="Search restaurant, cuisine..."
            className="input-field pl-11"
          />
          {filters.search && (
            <button
              onClick={() => updateFilter('search', '')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <FiX size={16} />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl border font-medium text-sm transition-all ${
            showFilters || hasActiveFilters
              ? 'bg-primary-500 text-white border-primary-500'
              : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
          }`}
        >
          <FiFilter size={16} />
          Filters
          {hasActiveFilters && (
            <span className="bg-white text-primary-500 text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">!</span>
          )}
        </button>
      </div>

      {/* Expanded Filters */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-white rounded-2xl shadow-card p-5 mb-6 space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Sort */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Sort By</label>
              <div className="flex flex-wrap gap-2">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => updateFilter('ordering', opt.value)}
                    className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${
                      filters.ordering === opt.value
                        ? 'bg-primary-500 text-white border-primary-500'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Price Range</label>
              <div className="flex flex-wrap gap-2">
                {PRICE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => updateFilter('price_range', opt.value)}
                    className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${
                      filters.price_range === opt.value
                        ? 'bg-primary-500 text-white border-primary-500'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Other */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Availability</label>
              <button
                onClick={() => updateFilter('is_open', filters.is_open ? '' : 'true')}
                className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${
                  filters.is_open
                    ? 'bg-green-500 text-white border-green-500'
                    : 'bg-white text-gray-600 border-gray-200'
                }`}
              >
                🟢 Open Now
              </button>
            </div>
          </div>

          {/* Cuisine Filter */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Cuisine Type</label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => updateFilter('cuisine', '')}
                className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${
                  !filters.cuisine ? 'bg-primary-500 text-white border-primary-500' : 'bg-white text-gray-600 border-gray-200'
                }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => updateFilter('cuisine', filters.cuisine === String(cat.id) ? '' : String(cat.id))}
                  className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${
                    filters.cuisine === String(cat.id)
                      ? 'bg-primary-500 text-white border-primary-500'
                      : 'bg-white text-gray-600 border-gray-200'
                  }`}
                >
                  {cat.icon} {cat.name}
                </button>
              ))}
            </div>
          </div>

          {hasActiveFilters && (
            <button onClick={clearFilters} className="text-sm text-red-500 hover:underline flex items-center gap-1">
              <FiX size={14} /> Clear all filters
            </button>
          )}
        </motion.div>
      )}

      {/* Restaurant Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(12)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : restaurants.length === 0 ? (
        <EmptyState
          icon="🔍"
          title="No restaurants found"
          subtitle="Try adjusting your search or filters"
          action={
            <button onClick={clearFilters} className="btn-primary">
              Clear Filters
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {restaurants.map((restaurant, i) => (
            <motion.div
              key={restaurant.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.04, 0.4) }}
            >
              <RestaurantCard restaurant={restaurant} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
