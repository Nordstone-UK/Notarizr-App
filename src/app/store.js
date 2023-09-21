import {configureStore} from '@reduxjs/toolkit';
import userReducer from '../features/user/userSlice';
import paymentReducer from '../features/review/reviewSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    payment: paymentReducer,
  },
});
