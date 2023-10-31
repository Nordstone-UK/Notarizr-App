import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  booking: [],
  coordinates: [],
  user: [],
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
    setUser: (state, action) => {
      state.user = action.payload;
      console.log('user Info Set in Redux', state.user);
    },
  },
});

export const {setBookingInfoState, setCoordinates, setUser} =
  bookingSlice.actions;

export default bookingSlice.reducer;
