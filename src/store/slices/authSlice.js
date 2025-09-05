import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    isAuthenticated: false,
    userType: null, // 'admin' or 'client'
  },
  reducers: {
    login: (state, action) => {
      const { user, userType } = action.payload;
      state.user = user;
      state.isAuthenticated = true;
      state.userType = userType;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.userType = null;
    },
    setUserType: (state, action) => {
      state.userType = action.payload;
    },
  },
});

export const { login, logout, setUserType } = authSlice.actions;
export default authSlice.reducer;