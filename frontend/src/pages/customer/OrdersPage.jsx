import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiPackage, FiChevronRight } from 'react-icons/fi';
import { ordersAPI } from '../../services/api';
import { OrderStatusBadge, EmptyState, LoadingSpinner } from '../../components/common/UI';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=60&h=60&fit=crop';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    ordersAPI.getMyOrders().then((res) => {
      setOrders(res.data.results || res.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const TABS = [
    { value: 'all', label: 'All Orders' },
    { value: 'active', label: 'Active' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  const filterOrders = (orders) => {
    if (activeTab === 'active') return orders.filter((o) => !['delivered', 'cancelled'].includes(o.status));
    if (activeTab === 'delivered') return orders.filter((o) => o.status === 'delivered');
    if (activeTab === 'cancelled') return orders.filter((o) => o.status === 'cancelled');
    return orders;
  };

  const filtered = filterOrders(orders);

  return (
    <div className="container-page py-8">
      <h1 className="section-title mb-6">My Orders</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === tab.value
                ? 'bg-primary-500 text-white shadow-orange'
                : 'bg-white text-gray-600 shadow-card hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner size="lg" className="py-16" />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="📦"
          title="No orders found"
          subtitle={activeTab === 'all' ? "You haven't placed any orders yet" : `No ${activeTab} orders`}
          action={
            <Link to="/restaurants" className="btn-primary">
              Order Now
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {filtered.map((order, i) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link to={`/orders/${order.id}`} className="block">
                <div className="bg-white rounded-2xl shadow-card p-5 hover:shadow-card-hover transition-all group">
                  <div className="flex items-start gap-4">
                    <img
                      src={order.restaurant_logo ? `http://localhost:8000${order.restaurant_logo}` : PLACEHOLDER}
                      alt={order.restaurant_name}
                      className="w-14 h-14 rounded-xl object-cover flex-shrink-0 bg-gray-100"
                      onError={(e) => { e.target.src = PLACEHOLDER; }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 group-hover:text-primary-500 transition-colors">
                          {order.restaurant_name}
                        </h3>
                        <OrderStatusBadge status={order.status} />
                      </div>
                      <p className="text-xs text-gray-400 mb-1">#{order.order_number}</p>
                      <p className="text-sm text-gray-500 mb-2">
                        {order.items_count} item{order.items_count !== 1 ? 's' : ''} · ₹{order.total}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(order.placed_at).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric',
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <FiChevronRight size={18} className="text-gray-300 group-hover:text-primary-400 flex-shrink-0 mt-1 transition-colors" />
                  </div>

                  {order.status === 'delivered' && (
                    <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
                      <span className="text-sm text-gray-500">Delivered on {new Date(order.delivered_at).toLocaleDateString('en-IN')}</span>
                      <button className="text-sm text-primary-500 font-medium hover:underline">Rate Order</button>
                    </div>
                  )}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
