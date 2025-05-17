import {configureStore} from '@reduxjs/toolkit';
import authReducer from './authSlice';
import pageReducer from './pageSlice';

export const store = configureStore({
	reducer: {
		auth: authReducer,
		page: pageReducer,
	},
});