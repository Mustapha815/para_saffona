import { configureStore } from '@reduxjs/toolkit';
import productsReducer from './slices/productsSlice';
import customersReducer from './slices/customersSlice';
import salesReducer from './slices/salesSlice';
import uiReducer from './slices/uiSlice';
import categoriesReducer from './slices/categoriesSlice';
import authReducer from './slices/authSlice';

export const store = configureStore({
  reducer: {
    products: productsReducer,
    customers: customersReducer,
    sales: salesReducer,
    ui: uiReducer,
    categories: categoriesReducer,
    auth: authReducer,
  },
});