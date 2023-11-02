import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  payment: false,
};

export const reviewSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    paymentCheck: state => {
      state.payment = !state.payment;
      // console.log(state.payment);
    },
  },
});

export const {paymentCheck} = reviewSlice.actions;

export default reviewSlice.reducer;
