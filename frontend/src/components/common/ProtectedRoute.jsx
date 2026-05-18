/**
 * ProtectedRoute - Guards routes based on auth and role
 * 
 * Usage:
 * <ProtectedRoute allowedRoles={['customer']}>
 *   <CartPage />
 * </ProtectedRoute>
 */

import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectUser } from '../../store/slices/authSlice';

export default function ProtectedRoute({ children, allowedRoles }) {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login, preserving the intended destination
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // User doesn't have the required role - redirect to appropriate dashboard
    const roleRedirects = {
      restaurant_owner: '/restaurant-dashboard',
      delivery_partner: '/delivery-dashboard',
      customer: '/',
    };
    return <Navigate to={roleRedirects[user?.role] || '/'} replace />;
  }

  return children;
}
