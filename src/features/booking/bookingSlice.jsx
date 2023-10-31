import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  booking: [],
  coordinates: [],
};

export const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    setBookingInfoState: (state, action) => {
      state.booking = action.payload;
      console.log('Booking Info Set in Redux', state.booking);
    },
    setCoordinates: (state, action) => {
      state.coordinates = action.payload;
      console.log('coordinates Info Set in Redux', state.coordinates);
    },
  },
});

export const {setBookingInfoState, setCoordinates} = bookingSlice.actions;

export default bookingSlice.reducer;
