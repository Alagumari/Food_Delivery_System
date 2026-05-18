/**
 * Cart Slice
 * Manages shopping cart - single restaurant restriction enforced
 */

import { createSlice } from '@reduxjs/toolkit';

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    restaurantId: null,
    restaurantName: '',
    restaurantDeliveryFee: 0,
    restaurantMinOrder: 0,
  },
  reducers: {
    addItem: (state, action) => {
      const { item, restaurantId, restaurantName, deliveryFee, minOrder } = action.payload;

      // If cart has items from a different restaurant, warn (handled in component)
      if (state.restaurantId && state.restaurantId !== restaurantId) {
        return; // Component should show confirmation dialog first
      }

      state.restaurantId = restaurantId;
      state.restaurantName = restaurantName;
      state.restaurantDeliveryFee = deliveryFee;
      state.restaurantMinOrder = minOrder;

      const existingIndex = state.items.findIndex(
        (i) => i.id === item.id && i.variantId === item.variantId
      );

      if (existingIndex >= 0) {
        state.items[existingIndex].quantity += 1;
      } else {
        state.items.push({ ...item, quantity: 1 });
      }
    },

    removeItem: (state, action) => {
      const { itemId, variantId } = action.payload;
      const index = state.items.findIndex(
        (i) => i.id === itemId && i.variantId === variantId
      );
      if (index >= 0) {
        if (state.items[index].quantity > 1) {
          state.items[index].quantity -= 1;
        } else {
          state.items.splice(index, 1);
        }
      }
      // Clear restaurant if cart empty
      if (state.items.length === 0) {
        state.restaurantId = null;
        state.restaurantName = '';
      }
    },

    deleteItem: (state, action) => {
      const { itemId, variantId } = action.payload;
      state.items = state.items.filter(
        (i) => !(i.id === itemId && i.variantId === variantId)
      );
      if (state.items.length === 0) {
        state.restaurantId = null;
        state.restaurantName = '';
      }
    },

    clearCart: (state) => {
      state.items = [];
      state.restaurantId = null;
      state.restaurantName = '';
      state.restaurantDeliveryFee = 0;
      state.restaurantMinOrder = 0;
    },

    // Clear cart and add from new restaurant (after user confirms)
    replaceCart: (state, action) => {
      const { item, restaurantId, restaurantName, deliveryFee, minOrder } = action.payload;
      state.items = [{ ...item, quantity: 1 }];
      state.restaurantId = restaurantId;
      state.restaurantName = restaurantName;
      state.restaurantDeliveryFee = deliveryFee;
      state.restaurantMinOrder = minOrder;
    },
  },
});

export const { addItem, removeItem, deleteItem, clearCart, replaceCart } = cartSlice.actions;
export default cartSlice.reducer;

// Selectors
export const selectCartItems = (state) => state.cart.items;
export const selectCartRestaurantId = (state) => state.cart.restaurantId;
export const selectCartRestaurantName = (state) => state.cart.restaurantName;
export const selectCartDeliveryFee = (state) => state.cart.restaurantDeliveryFee;
export const selectCartMinOrder = (state) => state.cart.restaurantMinOrder;

export const selectCartItemCount = (state) =>
  state.cart.items.reduce((total, item) => total + item.quantity, 0);

export const selectCartSubtotal = (state) =>
  state.cart.items.reduce((total, item) => total + item.price * item.quantity, 0);

export const selectItemQuantityInCart = (itemId, variantId = null) => (state) => {
  const item = state.cart.items.find(
    (i) => i.id === itemId && i.variantId === variantId
  );
  return item ? item.quantity : 0;
};
