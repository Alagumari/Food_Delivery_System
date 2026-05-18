import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { FiShoppingCart, FiUser, FiMenu, FiX, FiLogOut, FiPackage, FiHome } from 'react-icons/fi';
import { MdRestaurantMenu, MdDeliveryDining } from 'react-icons/md';
import { selectUser, selectIsAuthenticated, logout } from '../../store/slices/authSlice';
import { selectCartItemCount } from '../../store/slices/cartSlice';
import toast from 'react-hot-toast';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const cartCount = useSelector(selectCartItemCount);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    toast.success('Logged out successfully');
    navigate('/');
    setUserMenuOpen(false);
  };

  const getDashboardLink = () => {
    if (!user) return null;
    const links = {
      restaurant_owner: { href: '/restaurant-dashboard', label: 'Restaurant Dashboard', icon: <MdRestaurantMenu /> },
      delivery_partner: { href: '/delivery-dashboard', label: 'Delivery Dashboard', icon: <MdDeliveryDining /> },
    };
    return links[user.role] || null;
  };

  const dashboardLink = getDashboardLink();

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container-page">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">🍔</span>
            <span className="font-display font-bold text-xl text-primary-500">FoodRush</span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-gray-600 hover:text-primary-500 font-medium transition-colors">
              Home
            </Link>
            <Link to="/restaurants" className="text-gray-600 hover:text-primary-500 font-medium transition-colors">
              Restaurants
            </Link>
            {dashboardLink && (
              <Link to={dashboardLink.href} className="text-gray-600 hover:text-primary-500 font-medium transition-colors flex items-center gap-1">
                {dashboardLink.icon}
                {dashboardLink.label}
              </Link>
            )}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            
            {/* Cart Button (customers only) */}
            {(!user || user.role === 'customer') && (
              <Link to="/cart" className="relative p-2 text-gray-600 hover:text-primary-500 transition-colors">
                <FiShoppingCart size={22} />
                {cartCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-primary-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
                  >
                    {cartCount > 9 ? '9+' : cartCount}
                  </motion.span>
                )}
              </Link>
            )}

            {/* Auth Buttons / User Menu */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 rounded-full px-3 py-2 transition-colors"
                >
                  <div className="w-7 h-7 bg-primary-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {user?.full_name?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-gray-700 max-w-[100px] truncate">
                    {user?.full_name?.split(' ')[0] || 'User'}
                  </span>
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50"
                    >
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-900">{user?.full_name}</p>
                        <p className="text-xs text-gray-500 capitalize">{user?.role?.replace('_', ' ')}</p>
                      </div>
                      <Link
                        to="/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <FiUser size={16} /> My Profile
                      </Link>
                      {user?.role === 'customer' && (
                        <Link
                          to="/orders"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <FiPackage size={16} /> My Orders
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <FiLogOut size={16} /> Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn-secondary py-2 px-4 text-sm">
                  Login
                </Link>
                <Link to="/register" className="btn-primary py-2 px-4 text-sm">
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-gray-600"
            >
              {mobileOpen ? <FiX size={22} /> : <FiMenu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-gray-100 py-3 space-y-1"
            >
              <Link to="/" className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">
                <FiHome size={18} /> Home
              </Link>
              <Link to="/restaurants" className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">
                <MdRestaurantMenu size={18} /> Restaurants
              </Link>
              {dashboardLink && (
                <Link to={dashboardLink.href} className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">
                  {dashboardLink.icon} {dashboardLink.label}
                </Link>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Close user menu on outside click */}
      {userMenuOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
      )}
    </nav>
  );
}
