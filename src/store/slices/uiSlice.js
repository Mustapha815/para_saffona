import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    currentView: 'dashboard',
    language: 'en',
  },
  reducers: {
    setCurrentView: (state, action) => {
      state.currentView = action.payload;
    },
    setLanguage: (state, action) => {
      state.language = action.payload;
    },
  },
});

export const { setCurrentView, setLanguage } = uiSlice.actions;
export default uiSlice.reducer;