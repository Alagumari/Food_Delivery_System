import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiShoppingBag, FiDollarSign, FiStar, FiToggleLeft, FiToggleRight,
  FiMenu, FiTrendingUp, FiClock, FiAlertCircle
} from 'react-icons/fi';
import { MdRestaurant, MdDeliveryDining } from 'react-icons/md';
import toast from 'react-hot-toast';
import { restaurantAPI, ordersAPI } from '../../services/api';
import { OrderStatusBadge, LoadingSpinner } from '../../components/common/UI';

function StatCard({ icon, label, value, sub, color = 'orange' }) {
  const colors = {
    orange: 'bg-orange-50 text-orange-500',
    green:  'bg-green-50 text-green-500',
    blue:   'bg-blue-50 text-blue-500',
    purple: 'bg-purple-50 text-purple-500',
  };
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors[color]}`}>
          {icon}
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </motion.div>
  );
}

export default function RestaurantDashboard() {
  const [restaurant, setRestaurant] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [restRes, ordersRes] = await Promise.all([
        restaurantAPI.getMyRestaurant(),
        ordersAPI.getRestaurantOrders({ page: 1 }),
      ]);
      setRestaurant(restRes.data);
      const orders = ordersRes.data.results || ordersRes.data;
      setRecentOrders(orders.slice(0, 6));
    } catch (err) {
      if (err.response?.status === 404) {
        setRestaurant(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleToggleOpen = async () => {
    setToggling(true);
    try {
      const res = await restaurantAPI.toggleOpen();
      setRestaurant(r => ({ ...r, is_open: res.data.is_open }));
      toast.success(res.data.message);
    } catch { toast.error('Failed to update status'); }
    finally { setToggling(false); }
  };

  if (loading) return <LoadingSpinner size="lg" className="min-h-screen" />;

  // No restaurant created yet
  if (!restaurant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="card max-w-md w-full text-center">
          <div className="text-6xl mb-4">🍕</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Set up your restaurant</h2>
          <p className="text-gray-500 mb-6">You haven't created a restaurant yet. Let's get started!</p>
          <Link to="/restaurant-dashboard/setup" className="btn-primary inline-block">
            Create My Restaurant
          </Link>
        </motion.div>
      </div>
    );
  }

  const pendingOrders = recentOrders.filter(o => o.status === 'pending').length;
  const todayRevenue = recentOrders
    .filter(o => o.status === 'delivered' && new Date(o.placed_at).toDateString() === new Date().toDateString())
    .reduce((sum, o) => sum + parseFloat(o.total || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container-page py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center text-xl">
              🍽️
            </div>
            <div>
              <h1 className="font-bold text-gray-900 leading-tight">{restaurant.name}</h1>
              <p className="text-xs text-gray-500">{restaurant.city}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleOpen}
              disabled={toggling}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
                restaurant.is_open
                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                  : 'bg-red-100 text-red-700 hover:bg-red-200'
              }`}
            >
              {restaurant.is_open
                ? <><FiToggleRight size={18} /> Open</>
                : <><FiToggleLeft size={18} /> Closed</>}
            </button>
          </div>
        </div>
      </div>

      <div className="container-page py-6 space-y-6">

        {/* Pending Alert */}
        {pendingOrders > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <FiAlertCircle className="text-yellow-500" size={20} />
              <div>
                <p className="font-semibold text-yellow-800">
                  {pendingOrders} new order{pendingOrders > 1 ? 's' : ''} waiting!
                </p>
                <p className="text-sm text-yellow-600">Accept or reject them now</p>
              </div>
            </div>
            <Link to="/restaurant-dashboard/orders" className="bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
              View Orders
            </Link>
          </motion.div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={<FiShoppingBag size={20} />} label="Total Orders" value={restaurant.total_orders} color="orange" />
          <StatCard icon={<FiDollarSign size={20} />} label="Today's Revenue" value={`₹${todayRevenue.toFixed(0)}`} color="green" />
          <StatCard icon={<FiStar size={20} />} label="Rating" value={`${restaurant.rating}/5`} sub={`${restaurant.total_reviews} reviews`} color="purple" />
          <StatCard icon={<FiClock size={20} />} label="Avg Delivery" value={`${restaurant.delivery_time} min`} color="blue" />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link to="/restaurant-dashboard/orders" className="card hover:shadow-card-hover transition-all flex items-center gap-4 cursor-pointer">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
              <FiShoppingBag size={22} />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Manage Orders</p>
              <p className="text-sm text-gray-500">{pendingOrders} pending</p>
            </div>
          </Link>
          <Link to="/restaurant-dashboard/menu" className="card hover:shadow-card-hover transition-all flex items-center gap-4 cursor-pointer">
            <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500">
              <FiMenu size={22} />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Menu Management</p>
              <p className="text-sm text-gray-500">Add / edit items</p>
            </div>
          </Link>
          <Link to="/restaurant-dashboard/settings" className="card hover:shadow-card-hover transition-all flex items-center gap-4 cursor-pointer">
            <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-500">
              <MdRestaurant size={22} />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Restaurant Info</p>
              <p className="text-sm text-gray-500">Update details</p>
            </div>
          </Link>
        </div>

        {/* Recent Orders */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
            <Link to="/restaurant-dashboard/orders" className="text-sm text-primary-500 hover:underline font-medium">
              View all →
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <FiShoppingBag size={36} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">No orders yet. Share your restaurant link!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b border-gray-100">
                    <th className="pb-3 font-medium">Order</th>
                    <th className="pb-3 font-medium">Customer</th>
                    <th className="pb-3 font-medium">Items</th>
                    <th className="pb-3 font-medium">Total</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recentOrders.map(order => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 font-mono font-semibold text-gray-800">#{order.order_number}</td>
                      <td className="py-3 text-gray-700">{order.customer_name || '—'}</td>
                      <td className="py-3 text-gray-600">{order.items_count || (order.items?.length)} items</td>
                      <td className="py-3 font-semibold text-gray-900">₹{parseFloat(order.total).toFixed(0)}</td>
                      <td className="py-3"><OrderStatusBadge status={order.status} /></td>
                      <td className="py-3 text-gray-400">
                        {new Date(order.placed_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
