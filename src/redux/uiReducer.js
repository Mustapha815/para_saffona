import { createSlice } from '@reduxjs/toolkit';

const uiReducer = createSlice({
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

export const { setCurrentView, setLanguage } = uiReducer.actions;
export default uiReducer.reducer;