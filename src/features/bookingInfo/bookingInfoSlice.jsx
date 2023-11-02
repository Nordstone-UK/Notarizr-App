import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  booking: [],
};

export const bookingInfoSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    setBookingState: (state, action) => {
      state.booking = action.payload;
      // console.log('Booking Set in Redux', state.booking[0].__typename);
    },
  },
});

export const {setBookingState} = bookingInfoSlice.actions;

export default bookingInfoSlice.reducer;
