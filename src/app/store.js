import {configureStore} from '@reduxjs/toolkit';
import userReducer from '../features/user/userSlice';
import paymentReducer from '../features/review/reviewSlice';
import serviceReducer from '../features/service/serviceSlice';
import registerReducer from '../features/register/registerSlice';
import agentServiceReducer from '../features/agentService/agentServiceSlice';
import bookingInfoReducer from '../features/bookingInfo/bookingInfoSlice';
export const store = configureStore({
  reducer: {
    user: userReducer,
    payment: paymentReducer,
    service: serviceReducer,
    register: registerReducer,
    agentService: agentServiceReducer,
    bookingInfo: bookingInfoReducer,
  },
});
