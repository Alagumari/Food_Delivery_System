import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { loginUser, clearError, selectAuthLoading, selectAuthError, selectIsAuthenticated, selectUser } from '../store/slices/authSlice';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const loading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      const from = location.state?.from?.pathname;
      const roleDefaults = {
        restaurant_owner: '/restaurant-dashboard',
        delivery_partner: '/delivery-dashboard',
        customer: '/',
        admin: '/',
      };
      navigate(from || roleDefaults[user.role] || '/', { replace: true });
    }
  }, [isAuthenticated, user, navigate, location]);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(loginUser(form));
    if (loginUser.fulfilled.match(result)) {
      toast.success(`Welcome back, ${result.payload.full_name?.split(' ')[0]}! 👋`);
    }
  };

  // const fillDemo = (role) => {
  //   const demos = {
  //     customer: { email: 'customer@test.com', password: 'test123' },
  //     owner: { email: 'owner@pizza.com', password: 'test123' },
  //     delivery: { email: 'driver@test.com', password: 'test123' },
  //   };
  //   setForm(demos[role]);
  // };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-orange-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <span className="text-4xl">🍔</span>
            <span className="font-display font-bold text-3xl text-primary-500">FoodRush</span>
          </Link>
          <h1 className="text-2xl font-display font-bold text-gray-900">Welcome back!</h1>
          <p className="text-gray-500 mt-1">Sign in to continue ordering</p>
        </div>

        {/* Demo Quick Fill */}
        {/* <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
          <p className="text-xs font-semibold text-blue-700 mb-2">🚀 Demo Accounts (click to fill)</p>
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'customer', label: '🛒 Customer' },
              { key: 'owner', label: '🍕 Restaurant' },
              { key: 'delivery', label: '🚴 Delivery' },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => fillDemo(key)}
                className="text-xs bg-white border border-blue-200 text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors font-medium"
              >
                {label}
              </button>
            ))}
          </div>
        </div> */}

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-card p-8">
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-5 text-sm"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
              <div className="relative">
                <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                  className="input-field pl-10"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Enter your password"
                  className="input-field pl-10 pr-10"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-500 font-semibold hover:underline">
              Sign up free
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
