import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiMapPin, FiPackage, FiDollarSign, FiCheckCircle,
  FiRefreshCw, FiNavigation, FiClock, FiTrendingUp
} from 'react-icons/fi';
import { MdDeliveryDining, MdRestaurant } from 'react-icons/md';
import toast from 'react-hot-toast';
import { ordersAPI } from '../../services/api';
import { useSelector } from 'react-redux';
import { selectUser } from '../../store/slices/authSlice';
import { OrderStatusBadge, LoadingSpinner, EmptyState } from '../../components/common/UI';

const DELIVERY_NEXT = {
  picked_up:  { label: 'Start Delivery', next: 'on_the_way', color: 'bg-orange-500 hover:bg-orange-600 text-white' },
  on_the_way: { label: 'Mark Delivered', next: 'delivered',   color: 'bg-green-500 hover:bg-green-600 text-white' },
};

function StatCard({ icon, label, value, color }) {
  return (
    <div className="card text-center">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2 ${color}`}>
        {icon}
      </div>
      <p className="text-xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}

function AvailableOrderCard({ order, onAccept, accepting }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      className="card border-l-4 border-l-primary-400"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <MdRestaurant className="text-primary-500" size={16} />
            <span className="font-semibold text-gray-900 text-sm">{order.restaurant_name}</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-500 mb-1">
            <FiMapPin size={13} />
            <span className="truncate">{order.delivery_address}, {order.delivery_city}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="font-bold text-primary-500">₹{parseFloat(order.total).toFixed(0)}</span>
            <span className="text-gray-400">·</span>
            <span className="text-gray-600">{order.items?.length || '?'} items</span>
            <span className="text-gray-400">·</span>
            <span className="text-gray-600">#{order.order_number}</span>
          </div>
        </div>
        <button
          onClick={() => onAccept(order.id)}
          disabled={accepting === order.id}
          className="flex-shrink-0 btn-primary py-2 px-4 text-sm"
        >
          {accepting === order.id
            ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin block" />
            : 'Accept'}
        </button>
      </div>
    </motion.div>
  );
}

function ActiveDeliveryCard({ order, onUpdateStatus, updating }) {
  const nextAction = DELIVERY_NEXT[order.status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="card border-2 border-primary-200 bg-primary-50"
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs text-gray-500 mb-0.5">Active Delivery</p>
          <p className="font-bold text-gray-900 font-mono">#{order.order_number}</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-start gap-2 text-sm">
          <MdRestaurant className="text-primary-500 mt-0.5 flex-shrink-0" size={16} />
          <div>
            <p className="font-medium text-gray-800">{order.restaurant_name}</p>
            <p className="text-gray-500 text-xs">{order.restaurant_address || 'Restaurant location'}</p>
          </div>
        </div>
        <div className="flex items-start gap-2 text-sm">
          <FiMapPin className="text-red-500 mt-0.5 flex-shrink-0" size={16} />
          <div>
            <p className="font-medium text-gray-800">Deliver to customer</p>
            <p className="text-gray-500 text-xs">{order.delivery_address}, {order.delivery_city} - {order.delivery_pincode}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <a
          href={`https://maps.google.com/?q=${order.delivery_address},${order.delivery_city}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:border-primary-300 transition-colors"
        >
          <FiNavigation size={15} /> Navigate
        </a>
        {nextAction && (
          <button
            onClick={() => onUpdateStatus(order.id, nextAction.next)}
            disabled={updating}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-semibold transition-colors ${nextAction.color}`}
          >
            {updating
              ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <FiCheckCircle size={15} />}
            {nextAction.label}
          </button>
        )}
      </div>
    </motion.div>
  );
}

export default function DeliveryDashboard() {
  const user = useSelector(selectUser);
  const [tab, setTab] = useState('available');
  const [available, setAvailable] = useState([]);
  const [myDeliveries, setMyDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const [availRes, myRes] = await Promise.all([
        ordersAPI.getAvailable(),
        ordersAPI.getMyDeliveries(),
      ]);
      setAvailable(availRes.data.results || availRes.data);
      setMyDeliveries(myRes.data.results || myRes.data);
    } catch {
      if (!silent) toast.error('Failed to load deliveries');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Auto-refresh every 20s
  useEffect(() => {
    const id = setInterval(() => loadData(true), 20000);
    return () => clearInterval(id);
  }, [loadData]);

  const handleAccept = async (orderId) => {
    setAccepting(orderId);
    try {
      await ordersAPI.acceptDelivery(orderId);
      toast.success('Delivery accepted! Head to the restaurant.');
      await loadData(true);
      setTab('my');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to accept delivery');
    } finally {
      setAccepting(null);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    setUpdating(true);
    try {
      await ordersAPI.updateStatus(orderId, { status: newStatus });
      toast.success(newStatus === 'delivered' ? '🎉 Delivery completed!' : 'Status updated!');
      await loadData(true);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Update failed');
    } finally {
      setUpdating(false);
    }
  };

  // Stats
  const completed = myDeliveries.filter(d => d.status === 'delivered');
  const activeDeliveries = myDeliveries.filter(d => ['picked_up', 'on_the_way'].includes(d.status));
  const todayEarnings = completed
    .filter(d => new Date(d.delivered_at || d.placed_at).toDateString() === new Date().toDateString())
    .reduce((sum, d) => sum + parseFloat(d.delivery_fee || 30), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-500 to-orange-500 text-white">
        <div className="container-page py-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <MdDeliveryDining size={22} />
              </div>
              <div>
                <h1 className="font-display font-bold text-xl">Hey, {user?.full_name?.split(' ')[0]} 👋</h1>
                <p className="text-white/80 text-sm">Ready to deliver?</p>
              </div>
            </div>
            <button
              onClick={() => loadData(true)}
              className={`p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors ${refreshing ? 'animate-spin' : ''}`}
            >
              <FiRefreshCw size={18} />
            </button>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/20 rounded-2xl p-3 text-center">
              <p className="text-2xl font-bold">{completed.length}</p>
              <p className="text-xs text-white/80">Total Deliveries</p>
            </div>
            <div className="bg-white/20 rounded-2xl p-3 text-center">
              <p className="text-2xl font-bold">₹{todayEarnings.toFixed(0)}</p>
              <p className="text-xs text-white/80">Today's Earnings</p>
            </div>
            <div className="bg-white/20 rounded-2xl p-3 text-center">
              <p className="text-2xl font-bold">{activeDeliveries.length}</p>
              <p className="text-xs text-white/80">Active Now</p>
            </div>
          </div>
        </div>
      </div>

      {/* Active Deliveries Banner */}
      {activeDeliveries.length > 0 && (
        <div className="container-page pt-4">
          <div className="space-y-3">
            {activeDeliveries.map(d => (
              <ActiveDeliveryCard
                key={d.id}
                order={d}
                onUpdateStatus={handleUpdateStatus}
                updating={updating}
              />
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="container-page mt-5">
        <div className="flex bg-white rounded-2xl p-1 shadow-card mb-5">
          {[
            { value: 'available', label: `Available (${available.length})` },
            { value: 'my', label: `My Deliveries (${myDeliveries.length})` },
          ].map(t => (
            <button
              key={t.value}
              onClick={() => setTab(t.value)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                tab === t.value ? 'bg-primary-500 text-white shadow' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <LoadingSpinner size="lg" className="py-16" />
        ) : tab === 'available' ? (
          available.length === 0 ? (
            <EmptyState
              icon="🛵"
              title="No available orders"
              subtitle="New delivery requests will appear here automatically."
            />
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-gray-500">{available.length} order{available.length !== 1 ? 's' : ''} waiting for pickup</p>
              <AnimatePresence>
                {available.map(order => (
                  <AvailableOrderCard
                    key={order.id}
                    order={order}
                    onAccept={handleAccept}
                    accepting={accepting}
                  />
                ))}
              </AnimatePresence>
            </div>
          )
        ) : (
          myDeliveries.length === 0 ? (
            <EmptyState
              icon="📦"
              title="No deliveries yet"
              subtitle="Accept your first delivery to get started!"
            />
          ) : (
            <div className="space-y-3">
              {myDeliveries.map((delivery, i) => (
                <motion.div
                  key={delivery.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="card"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono font-semibold text-gray-900">#{delivery.order_number}</span>
                        <OrderStatusBadge status={delivery.status} />
                      </div>
                      <p className="text-sm text-gray-600">{delivery.restaurant_name}</p>
                      <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                        <FiMapPin size={11} /> {delivery.delivery_city}
                        <span className="mx-1">·</span>
                        <FiClock size={11} />
                        {new Date(delivery.placed_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">₹{parseFloat(delivery.total).toFixed(0)}</p>
                      <p className="text-xs text-green-600 font-medium">+₹{parseFloat(delivery.delivery_fee || 30).toFixed(0)} earned</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
