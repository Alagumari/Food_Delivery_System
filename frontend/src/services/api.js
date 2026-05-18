/**
 * API Service - Centralized HTTP client
 * 
 * Handles:
 * - Base URL configuration
 * - JWT token injection on every request
 * - Auto token refresh on 401 errors
 * - Error normalization
 */

import axios from 'axios';

const BASE_URL = 'http://localhost:8000/api';

// Create axios instance
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// =====================
// REQUEST INTERCEPTOR
// Attach JWT token to every request
// =====================
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// =====================
// RESPONSE INTERCEPTOR
// Auto-refresh token on 401
// =====================
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refresh_token');

      if (refreshToken) {
        try {
          const response = await axios.post(`${BASE_URL}/auth/token/refresh/`, {
            refresh: refreshToken,
          });
          const { access } = response.data;
          localStorage.setItem('access_token', access);
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        } catch (refreshError) {
          // Refresh failed - logout user
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// =====================
// AUTH API
// =====================
export const authAPI = {
  register: (data) => api.post('/auth/register/', data),
  login: (data) => api.post('/auth/login/', data),
  getProfile: () => api.get('/auth/profile/'),
  updateProfile: (data) => api.patch('/auth/profile/', data),
  getAddresses: () => api.get('/auth/addresses/'),
  addAddress: (data) => api.post('/auth/addresses/', data),
  updateAddress: (id, data) => api.patch(`/auth/addresses/${id}/`, data),
  deleteAddress: (id) => api.delete(`/auth/addresses/${id}/`),
  setDefaultAddress: (id) => api.post(`/auth/addresses/${id}/set-default/`),
};

// =====================
// RESTAURANT API
// =====================
export const restaurantAPI = {
  getAll: (params) => api.get('/restaurants/', { params }),
  getById: (id) => api.get(`/restaurants/${id}/`),
  getCategories: () => api.get('/restaurants/categories/'),
  getMyRestaurant: () => api.get('/restaurants/my/'),
  create: (data) => api.post('/restaurants/create/', data),
  update: (data) => api.patch('/restaurants/my/', data),
  toggleOpen: () => api.post('/restaurants/toggle-open/'),
};

// =====================
// MENU API
// =====================
export const menuAPI = {
  getRestaurantMenu: (restaurantId) => api.get(`/menu/${restaurantId}/`),
  getMyItems: () => api.get('/menu/items/'),
  createItem: (data) => api.post('/menu/items/', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateItem: (id, data) => api.patch(`/menu/items/${id}/`, data),
  deleteItem: (id) => api.delete(`/menu/items/${id}/`),
  toggleAvailability: (id) => api.post(`/menu/items/${id}/toggle/`),
};

// =====================
// ORDERS API
// =====================
export const ordersAPI = {
  place: (data) => api.post('/orders/create/', data),
  getMyOrders: () => api.get('/orders/my/'),
  getById: (id) => api.get(`/orders/${id}/`),
  cancel: (id) => api.post(`/orders/${id}/cancel/`),

  // Restaurant owner
  getRestaurantOrders: (params) => api.get('/orders/restaurant/', { params }),
  updateStatus: (id, data) => api.post(`/orders/${id}/status/`, data),

  // Razorpay payment verification
  verifyPayment: (data) => api.post('/orders/verify-payment/', data),

  // Delivery partner
  getAvailable: () => api.get('/orders/available/'),
  acceptDelivery: (id) => api.post(`/orders/${id}/accept-delivery/`),
  getMyDeliveries: () => api.get('/orders/my-deliveries/'),
};

// =====================
// REVIEWS API
// =====================
export const reviewsAPI = {
  getRestaurantReviews: (restaurantId) => api.get(`/reviews/restaurant/${restaurantId}/`),
  create: (data) => api.post('/reviews/create/', data),
};

export default api;