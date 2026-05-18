import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiArrowLeft, FiRefreshCw, FiCheck, FiX, FiClock,
  FiChevronDown, FiChevronUp, FiPhone
} from 'react-icons/fi';
import { MdDeliveryDining } from 'react-icons/md';
import toast from 'react-hot-toast';
import { ordersAPI } from '../../services/api';
import { OrderStatusBadge, LoadingSpinner, EmptyState } from '../../components/common/UI';

const STATUS_TABS = [
  { value: '', label: 'All' },
  { value: 'pending', label: '🔔 Pending' },
  { value: 'accepted', label: '✅ Accepted' },
  { value: 'preparing', label: '👨‍🍳 Preparing' },
  { value: 'ready', label: '📦 Ready' },
  { value: 'delivered', label: '🎉 Delivered' },
  { value: 'cancelled', label: '❌ Cancelled' },
];

const NEXT_STATUS = {
  pending:   { label: 'Accept Order',    next: 'accepted',  color: 'bg-green-500 hover:bg-green-600 text-white' },
  accepted:  { label: 'Start Preparing', next: 'preparing', color: 'bg-blue-500 hover:bg-blue-600 text-white' },
  preparing: { label: 'Mark Ready',      next: 'ready',     color: 'bg-indigo-500 hover:bg-indigo-600 text-white' },
};

function OrderCard({ order, onStatusUpdate }) {
  const [expanded, setExpanded] = useState(order.status === 'pending');
  const [updating, setUpdating] = useState(false);

  const nextAction = NEXT_STATUS[order.status];

  const handleUpdate = async (newStatus) => {
    setUpdating(true);
    try {
      await ordersAPI.updateStatus(order.id, { status: newStatus });
      toast.success(`Order #${order.order_number} → ${newStatus}`);
      onStatusUpdate(order.id, newStatus);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Update failed');
    } finally {
      setUpdating(false);
    }
  };

  const timeAgo = (dateStr) => {
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 60000);
    if (diff < 1) return 'just now';
    if (diff < 60) return `${diff}m ago`;
    return `${Math.floor(diff / 60)}h ago`;
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className={`card overflow-hidden ${order.status === 'pending' ? 'border-l-4 border-l-yellow-400' : ''}`}
    >
      {/* Header Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-900 font-mono">#{order.order_number}</span>
              <OrderStatusBadge status={order.status} />
            </div>
            <p className="text-sm text-gray-500 mt-0.5">
              ₹{parseFloat(order.total).toFixed(2)} · {order.items?.length} items · {timeAgo(order.placed_at)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Reject (pending only) */}
          {order.status === 'pending' && (
            <button
              onClick={() => handleUpdate('cancelled')}
              disabled={updating}
              className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-medium bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
            >
              <FiX size={15} /> Reject
            </button>
          )}

          {/* Next Action */}
          {nextAction && (
            <button
              onClick={() => handleUpdate(nextAction.next)}
              disabled={updating}
              className={`flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${nextAction.color}`}
            >
              {updating
                ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <FiCheck size={15} />}
              {nextAction.label}
            </button>
          )}

          {/* Expand Toggle */}
          <button
            onClick={() => setExpanded(e => !e)}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {expanded ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
          </button>
        </div>
      </div>

      {/* Expanded Details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Items */}
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Order Items</h4>
                <div className="space-y-1.5">
                  {order.items?.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-gray-700">
                        {item.quantity}× {item.menu_item_name}
                        {item.variant_name && <span className="text-gray-400"> ({item.variant_name})</span>}
                      </span>
                      <span className="font-medium text-gray-900">₹{parseFloat(item.total_price).toFixed(0)}</span>
                    </div>
                  ))}
                </div>

                {order.special_instructions && (
                  <div className="mt-3 p-2 bg-yellow-50 rounded-lg">
                    <p className="text-xs text-yellow-700">
                      <span className="font-semibold">Note:</span> {order.special_instructions}
                    </p>
                  </div>
                )}
              </div>

              {/* Delivery Info */}
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Delivery Info</h4>
                <div className="space-y-2 text-sm text-gray-700">
                  <p>📍 {order.delivery_address}, {order.delivery_city}</p>
                  <p>📬 {order.delivery_pincode}</p>
                  {order.delivery_partner_name && (
                    <p className="flex items-center gap-1">
                      <MdDeliveryDining size={16} className="text-primary-500" />
                      {order.delivery_partner_name}
                    </p>
                  )}
                </div>

                {/* Pricing */}
                <div className="mt-3 pt-3 border-t border-gray-100 space-y-1 text-sm">
                  <div className="flex justify-between text-gray-500">
                    <span>Subtotal</span><span>₹{parseFloat(order.subtotal).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Delivery</span><span>₹{parseFloat(order.delivery_fee).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-gray-900">
                    <span>Total</span><span>₹{parseFloat(order.total).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Status History */}
            {order.status_history?.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Timeline</h4>
                <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                  {order.status_history.map((h, i) => (
                    <div key={i} className="flex-shrink-0 text-center">
                      <div className="w-2 h-2 rounded-full bg-primary-500 mx-auto mb-1" />
                      <p className="text-xs font-medium text-gray-700 capitalize">{h.status.replace('_', ' ')}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(h.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function RestaurantOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const loadOrders = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const params = activeTab ? { status: activeTab } : {};
      const res = await ordersAPI.getRestaurantOrders(params);
      setOrders(res.data.results || res.data);
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeTab]);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => loadOrders(true), 30000);
    return () => clearInterval(interval);
  }, [loadOrders]);

  const handleStatusUpdate = (orderId, newStatus) => {
    setOrders(prev =>
      prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o)
    );
  };

  const filtered = activeTab ? orders.filter(o => o.status === activeTab) : orders;
  const pendingCount = orders.filter(o => o.status === 'pending').length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container-page py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Link to="/restaurant-dashboard" className="text-gray-400 hover:text-gray-600">
                <FiArrowLeft size={20} />
              </Link>
              <h1 className="font-display font-bold text-xl text-gray-900">Orders</h1>
              {pendingCount > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold rounded-full px-2 py-0.5 animate-pulse">
                  {pendingCount} new
                </span>
              )}
            </div>
            <button
              onClick={() => loadOrders(true)}
              className={`flex items-center gap-1 text-sm text-gray-500 hover:text-primary-500 transition-colors ${refreshing ? 'animate-spin text-primary-500' : ''}`}
            >
              <FiRefreshCw size={16} />
              {!refreshing && 'Refresh'}
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {STATUS_TABS.map(tab => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  activeTab === tab.value
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container-page py-6">
        {loading ? (
          <LoadingSpinner size="lg" className="py-20" />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="📋"
            title="No orders here"
            subtitle={activeTab ? `No ${activeTab} orders right now.` : 'Orders will appear here when customers place them.'}
          />
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {filtered.map(order => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onStatusUpdate={handleStatusUpdate}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
