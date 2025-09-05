import { createSlice } from '@reduxjs/toolkit';

const initialCustomers = [
  {
    id: '1',
    name: 'Fatima El Mansouri',
    email: 'fatima@email.com',
    phone: '+212 6 12 34 56 78',
    address: 'Casablanca, Morocco',
    loyaltyPoints: 150,
    totalPurchases: 1250,
    lastPurchase: '2024-01-15'
  },
  {
    id: '2',
    name: 'Ahmed Benali',
    email: 'ahmed@email.com',
    phone: '+212 6 98 76 54 32',
    address: 'Rabat, Morocco',
    loyaltyPoints: 85,
    totalPurchases: 850,
    lastPurchase: '2024-01-10'
  }
];

const customersSlice = createSlice({
  name: 'customers',
  initialState: {
    items: initialCustomers,
  },
  reducers: {
    addCustomer: (state, action) => {
      const newCustomer = { ...action.payload, id: Date.now().toString() };
      state.items.push(newCustomer);
    },
    updateCustomer: (state, action) => {
      const { id, ...updates } = action.payload;
      const index = state.items.findIndex(customer => customer.id === id);
      if (index !== -1) {
        state.items[index] = { ...state.items[index], ...updates };
      }
    },
    deleteCustomer: (state, action) => {
      state.items = state.items.filter(customer => customer.id !== action.payload);
    },
  },
});

export const { addCustomer, updateCustomer, deleteCustomer } = customersSlice.actions;
export default customersSlice.reducer;