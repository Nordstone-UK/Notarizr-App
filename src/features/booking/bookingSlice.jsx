import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  booking: [],
};

export const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    setBookingInfoState: (state, action) => {
      state.booking = action.payload;
      console.log('Booking Info Set in Redux', state.booking);
    },
  },
});

export const {setBookingInfoState} = bookingSlice.actions;

export default bookingSlice.reducer;
