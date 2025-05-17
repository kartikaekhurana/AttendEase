import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentPage: 'Home', // Default page
};

const pageSlice = createSlice({
  name: 'page',
  initialState,
  reducers: {
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload; // Update the current page
    },
  },
});

export const { setCurrentPage } = pageSlice.actions;
export default pageSlice.reducer;
