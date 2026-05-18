/**
 * App.jsx - Main Application Router
 * 
 * Route Structure:
 * /                     - Landing page
 * /login                - Login page
 * /register             - Registration page
 * /restaurants          - Browse restaurants (customer)
 * /restaurant/:id       - Restaurant detail + menu
 * /cart                 - Shopping cart
 * /checkout             - Checkout flow
 * /orders               - Order history
 * /orders/:id           - Order tracking
 * /profile              - User profile
 * 
 * /restaurant-dashboard - Restaurant owner panel
 * /delivery-dashboard   - Delivery partner panel
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import store from './store';

// Layouts
import CustomerLayout from './components/common/CustomerLayout';
import ProtectedRoute from './components/common/ProtectedRoute';

// Customer Pages
import HomePage from './pages/customer/HomePage';
import RestaurantsPage from './pages/customer/RestaurantsPage';
import RestaurantDetailPage from './pages/customer/RestaurantDetailPage';
import CartPage from './pages/customer/CartPage';
import CheckoutPage from './pages/customer/CheckoutPage';
import OrdersPage from './pages/customer/OrdersPage';
import OrderTrackingPage from './pages/customer/OrderTrackingPage';
import ProfilePage from './pages/customer/ProfilePage';

// Auth Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Restaurant Dashboard
import RestaurantDashboard from './pages/restaurant/RestaurantDashboard';
import RestaurantOrders from './pages/restaurant/RestaurantOrders';
import MenuManagement from './pages/restaurant/MenuManagement';

// Delivery Dashboard
import DeliveryDashboard from './pages/delivery/DeliveryDashboard';

export default function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#1f2937',
              color: '#f9fafb',
              borderRadius: '12px',
              padding: '12px 16px',
            },
            success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          }}
        />

        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Customer Routes */}
          <Route path="/" element={<CustomerLayout />}>
            <Route index element={<HomePage />} />
            <Route path="restaurants" element={<RestaurantsPage />} />
            <Route path="restaurant/:id" element={<RestaurantDetailPage />} />
            <Route path="cart" element={
              <ProtectedRoute allowedRoles={['customer']}>
                <CartPage />
              </ProtectedRoute>
            } />
            <Route path="checkout" element={
              <ProtectedRoute allowedRoles={['customer']}>
                <CheckoutPage />
              </ProtectedRoute>
            } />
            <Route path="orders" element={
              <ProtectedRoute allowedRoles={['customer']}>
                <OrdersPage />
              </ProtectedRoute>
            } />
            <Route path="orders/:id" element={
              <ProtectedRoute allowedRoles={['customer']}>
                <OrderTrackingPage />
              </ProtectedRoute>
            } />
            <Route path="profile" element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } />
          </Route>

          {/* Restaurant Owner Routes */}
          <Route path="/restaurant-dashboard" element={
            <ProtectedRoute allowedRoles={['restaurant_owner']}>
              <RestaurantDashboard />
            </ProtectedRoute>
          } />
          <Route path="/restaurant-dashboard/orders" element={
            <ProtectedRoute allowedRoles={['restaurant_owner']}>
              <RestaurantOrders />
            </ProtectedRoute>
          } />
          <Route path="/restaurant-dashboard/menu" element={
            <ProtectedRoute allowedRoles={['restaurant_owner']}>
              <MenuManagement />
            </ProtectedRoute>
          } />

          {/* Delivery Partner Routes */}
          <Route path="/delivery-dashboard" element={
            <ProtectedRoute allowedRoles={['delivery_partner']}>
              <DeliveryDashboard />
            </ProtectedRoute>
          } />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}
