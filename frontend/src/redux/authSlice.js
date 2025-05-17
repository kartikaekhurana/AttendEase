import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isAuthenticated: false,
  user: null,
  token: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      const {token, user} = action.payload;
      state.isAuthenticated = true;
      state.user = user; // Store user details
      state.token = token; // Store token
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
    },
    },
  },
);

export const { loginSuccess, logout, } = authSlice.actions;
export default authSlice.reducer;
