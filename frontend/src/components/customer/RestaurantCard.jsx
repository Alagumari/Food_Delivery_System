import { Link } from 'react-router-dom';
import { FiClock, FiTruck, FiStar } from 'react-icons/fi';
import { motion } from 'framer-motion';

const PLACEHOLDER_COVER = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=200&fit=crop';

export default function RestaurantCard({ restaurant }) {
  const {
    id, name, cuisine_types = [], cover_image, logo, rating,
    total_reviews, delivery_time, delivery_fee, min_order,
    is_open, is_featured, price_range,
  } = restaurant;

  return (
    <Link to={`/restaurant/${id}`}>
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-2xl shadow-card overflow-hidden group cursor-pointer"
      >
        {/* Cover Image */}
        <div className="relative h-48 overflow-hidden bg-gray-200">
          <img
            src={cover_image ? `http://localhost:8000${cover_image}` : PLACEHOLDER_COVER}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => { e.target.src = PLACEHOLDER_COVER; }}
          />

          {/* Overlay badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            {is_featured && (
              <span className="bg-primary-500 text-white text-xs font-bold px-2 py-1 rounded-lg">
                ⭐ Featured
              </span>
            )}
            {!is_open && (
              <span className="bg-gray-800/80 text-white text-xs font-bold px-2 py-1 rounded-lg">
                Closed
              </span>
            )}
          </div>

          {/* Logo */}
          {logo && (
            <div className="absolute bottom-3 left-3 w-12 h-12 rounded-xl bg-white shadow-md overflow-hidden border-2 border-white">
              <img
                src={`http://localhost:8000${logo}`}
                alt={`${name} logo`}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Price range */}
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-semibold px-2 py-1 rounded-lg">
            {price_range}
          </div>
        </div>

        {/* Info */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-semibold text-gray-900 text-base leading-tight group-hover:text-primary-500 transition-colors line-clamp-1">
              {name}
            </h3>
            <div className="flex items-center gap-1 flex-shrink-0">
              <FiStar className="text-yellow-400 fill-yellow-400" size={14} />
              <span className="text-sm font-semibold text-gray-800">{Number(rating).toFixed(1)}</span>
              <span className="text-xs text-gray-400">({total_reviews})</span>
            </div>
          </div>

          {/* Cuisines */}
          <p className="text-xs text-gray-500 mb-3 line-clamp-1">
            {cuisine_types.map((c) => c.name).join(' • ') || 'Various cuisines'}
          </p>

          {/* Meta Row */}
          <div className="flex items-center gap-4 text-xs text-gray-600">
            <div className="flex items-center gap-1">
              <FiClock size={12} className="text-gray-400" />
              <span>{delivery_time} mins</span>
            </div>
            <div className="flex items-center gap-1">
              <FiTruck size={12} className="text-gray-400" />
              <span>{delivery_fee === 0 ? 'Free delivery' : `₹${delivery_fee}`}</span>
            </div>
            <span className="ml-auto text-gray-400">Min ₹{min_order}</span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
