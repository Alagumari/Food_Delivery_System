import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiLock, FiPhone, FiEye, FiEyeOff } from 'react-icons/fi';
import { registerUser, clearError, selectAuthLoading, selectAuthError } from '../store/slices/authSlice';
import toast from 'react-hot-toast';

const ROLES = [
  { value: 'customer', label: '🛒 Customer', desc: 'Order food from restaurants' },
  { value: 'restaurant_owner', label: '🍕 Restaurant Owner', desc: 'List and manage your restaurant' },
  { value: 'delivery_partner', label: '🚴 Delivery Partner', desc: 'Deliver orders and earn money' },
];

export default function RegisterPage() {
  const [form, setForm] = useState({
    first_name: '', last_name: '', username: '',
    email: '', phone: '', password: '', password_confirm: '', role: 'customer',
  });
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const loading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);

  useEffect(() => { dispatch(clearError()); }, [dispatch]);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.password_confirm) {
      toast.error('Passwords do not match');
      return;
    }
    const result = await dispatch(registerUser(form));
    if (registerUser.fulfilled.match(result)) {
      toast.success('Account created! Please log in.');
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-orange-50 flex items-center justify-center p-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <span className="text-4xl">🍔</span>
            <span className="font-display font-bold text-3xl text-primary-500">FoodRush</span>
          </Link>
          <h1 className="text-2xl font-display font-bold text-gray-900">Create your account</h1>
          <p className="text-gray-500 mt-1">Join thousands of food lovers!</p>
        </div>

        <div className="bg-white rounded-2xl shadow-card p-8">
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-5 text-sm"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">I want to join as</label>
              <div className="grid grid-cols-1 gap-2">
                {ROLES.map((role) => (
                  <label
                    key={role.value}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      form.role === role.value
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={role.value}
                      checked={form.role === role.value}
                      onChange={update('role')}
                      className="sr-only"
                    />
                    <span className="text-xl">{role.label.split(' ')[0]}</span>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{role.label.slice(2)}</p>
                      <p className="text-xs text-gray-500">{role.desc}</p>
                    </div>
                    {form.role === role.value && (
                      <span className="ml-auto text-primary-500 font-bold text-lg">✓</span>
                    )}
                  </label>
                ))}
              </div>
            </div>

            {/* Name Row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">First Name</label>
                <div className="relative">
                  <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text" value={form.first_name} onChange={update('first_name')}
                    placeholder="John" className="input-field pl-9" required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Last Name</label>
                <input
                  type="text" value={form.last_name} onChange={update('last_name')}
                  placeholder="Doe" className="input-field" required
                />
              </div>
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Username</label>
              <input
                type="text" value={form.username} onChange={update('username')}
                placeholder="johndoe" className="input-field" required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
              <div className="relative">
                <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="email" value={form.email} onChange={update('email')}
                  placeholder="you@example.com" className="input-field pl-10" required
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
              <div className="relative">
                <FiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="tel" value={form.phone} onChange={update('phone')}
                  placeholder="+91 98765 43210" className="input-field pl-10"
                />
              </div>
            </div>

            {/* Password */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type={showPassword ? 'text' : 'password'} value={form.password} onChange={update('password')}
                    placeholder="Min 8 chars" className="input-field pl-9 pr-9" required
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm</label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="password" value={form.password_confirm} onChange={update('password_confirm')}
                    placeholder="Repeat password" className="input-field pl-9" required
                  />
                </div>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creating account...</>
              ) : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-500 font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
