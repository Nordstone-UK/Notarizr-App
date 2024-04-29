import {configureStore} from '@reduxjs/toolkit';
import userReducer from '../features/user/userSlice';
import paymentReducer from '../features/review/reviewSlice';
import serviceReducer from '../features/service/serviceSlice';
import registerReducer from '../features/register/registerSlice';
import agentServiceReducer from '../features/agentService/agentServiceSlice';
import bookingInfoReducer from '../features/bookingInfo/bookingInfoSlice';
import bookingReducer from '../features/booking/bookingSlice';
import chatsReduces from '../features/chats/chatsSlice';
import signatureReducer from '../features/signatures/signatureSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    payment: paymentReducer,
    service: serviceReducer,
    register: registerReducer,
    agentService: agentServiceReducer,
    bookingInfo: bookingInfoReducer,
    booking: bookingReducer,
    chats: chatsReduces,
    signature: signatureReducer,
  },
});
