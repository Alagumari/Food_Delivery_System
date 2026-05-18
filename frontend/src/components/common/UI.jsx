// =====================
// LoadingSpinner
// =====================
export function LoadingSpinner({ size = 'md', className = '' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`${sizes[size]} border-3 border-gray-200 border-t-primary-500 rounded-full animate-spin`}
        style={{ borderWidth: '3px' }}
      />
    </div>
  );
}

// =====================
// StarRating
// =====================
export function StarRating({ rating, size = 'sm', showNumber = true }) {
  const sizes = { sm: 'text-sm', md: 'text-base', lg: 'text-lg' };
  return (
    <div className={`flex items-center gap-1 ${sizes[size]}`}>
      <span className="text-yellow-400">★</span>
      <span className="font-semibold text-gray-800">{Number(rating).toFixed(1)}</span>
      {showNumber && <span className="text-gray-500"></span>}
    </div>
  );
}

// =====================
// FoodTypeBadge
// =====================
export function FoodTypeBadge({ type }) {
  const config = {
    veg: { label: 'Veg', color: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
    non_veg: { label: 'Non-Veg', color: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
    vegan: { label: 'Vegan', color: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
    egg: { label: 'Egg', color: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-500' },
  };
  const c = config[type] || config.veg;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded ${c.color}`}>
      <span className={`w-2 h-2 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}

// =====================
// OrderStatusBadge
// =====================
export function OrderStatusBadge({ status }) {
  const statusMap = {
    pending: { label: 'Pending', cls: 'bg-yellow-100 text-yellow-700' },
    accepted: { label: 'Accepted', cls: 'bg-blue-100 text-blue-700' },
    preparing: { label: 'Preparing', cls: 'bg-purple-100 text-purple-700' },
    ready: { label: 'Ready', cls: 'bg-indigo-100 text-indigo-700' },
    picked_up: { label: 'Picked Up', cls: 'bg-orange-100 text-orange-700' },
    on_the_way: { label: 'On the Way', cls: 'bg-orange-100 text-orange-700' },
    delivered: { label: 'Delivered', cls: 'bg-green-100 text-green-700' },
    cancelled: { label: 'Cancelled', cls: 'bg-red-100 text-red-700' },
  };
  const s = statusMap[status] || { label: status, cls: 'bg-gray-100 text-gray-700' };
  return (
    <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full ${s.cls}`}>
      {s.label}
    </span>
  );
}

// =====================
// EmptyState
// =====================
export function EmptyState({ icon, title, subtitle, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
      {subtitle && <p className="text-gray-500 mb-6 max-w-sm">{subtitle}</p>}
      {action}
    </div>
  );
}

// =====================
// SkeletonCard
// =====================
export function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-card animate-pulse">
      <div className="h-48 bg-gray-200" />
      <div className="p-4 space-y-3">
        <div className="h-5 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="h-4 bg-gray-200 rounded w-2/3" />
        <div className="flex gap-2 pt-1">
          <div className="h-6 bg-gray-200 rounded-full w-16" />
          <div className="h-6 bg-gray-200 rounded-full w-20" />
        </div>
      </div>
    </div>
  );
}

// =====================
// Modal
// =====================
export function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
