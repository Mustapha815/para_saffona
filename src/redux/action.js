import { toast } from "react-toastify";
// Cart Actions
export const addToCart = (product) => ({
  type: 'ADD_TO_CART',
  payload: product
});

// ✅ Send { id, isPack } for these actions
export const increaseQuantity = (id, isPack = false) => ({
  type: 'INCREASE_QUANTITY',
  payload: { id, isPack }
});

export const decreaseQuantity = (id, isPack = false) => ({
  type: 'DECREASE_QUANTITY',
  payload: { id, isPack }
});

export const removeFromCart = (id, isPack = false) => ({
  type: 'REMOVE_FROM_CART',
  payload: { id, isPack }
});


export const clearCart = () => ({
  type: 'CLEAR_CART'
});

export const setReorder = (items) => ({
  type: 'SET_REORDER',
  payload: items
});

// Favorite Actions
export const addToFavorites = (product) => ({
  type: 'ADD_TO_FAVORITES',
  payload: product
});

export const removeFromFavorites = (productId) => ({
  type: 'REMOVE_FROM_FAVORITES',
  payload: productId
});

export const clearFavorites = () => ({
  type: 'CLEAR_FAVORITES'
});

export const toggleFavorite = (product) => ({
  type: 'TOGGLE_FAVORITE',
  payload: product
});
export const setFvoritesCount = (count) => ({
  type: 'setFvoritesCount',
  payload: count
});
// Product Details Actions
export const SHOW_PRODUCT_DETAILS = 'SHOW_PRODUCT_DETAILS';
export const HIDE_PRODUCT_DETAILS = 'HIDE_PRODUCT_DETAILS';
export const SHOW_PACK_DETAILS = 'SHOW_PACK_DETAILS';
export const HIDE_PACK_DETAILS = 'HIDE_PACK_DETAILS';

export const showProductDetails = (product) => ({
  type: SHOW_PRODUCT_DETAILS,
  payload: product
});

export const hideProductDetails = () => ({
  type: HIDE_PRODUCT_DETAILS
});

export const showPackDetails = (pack) => ({
  type: SHOW_PACK_DETAILS,
  payload: pack
});

export const hidePackDetails = () => ({
  type: HIDE_PACK_DETAILS
});  
