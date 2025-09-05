import { createSlice } from '@reduxjs/toolkit';

const salesSlice = createSlice({
  name: 'sales',
  initialState: {
    items: [],
  },
  reducers: {
    addSale: (state, action) => {
      const newSale = { ...action.payload, id: Date.now().toString() };
      state.items.push(newSale);
    },
    deleteSale: (state, action) => {
      state.items = state.items.filter(sale => sale.id !== action.payload);
    },
  },
});

export const { addSale, deleteSale } = salesSlice.actions;
export default salesSlice.reducer;