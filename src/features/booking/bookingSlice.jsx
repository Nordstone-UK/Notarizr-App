import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  booking: [],
  coordinates: [],
  user: [],
  numberOfDocs: 0,
  navigationStatus: '',
};

export const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    setBookingInfoState: (state, action) => {
      state.booking = action.payload;
      // console.log('Booking Info Set in Redux', state.booking);
    },
    setCoordinates: (state, action) => {
      state.coordinates = action.payload;
      // console.log('coordinates Info Set in Redux', state.coordinates);
    },
    setUser: (state, action) => {
      state.user = action.payload;
      // console.log('user Info Set in Redux', state.user);
    },
    setNumberOfDocs: (state, action) => {
      state.numberOfDocs = action.payload;
      console.log('user Info Set in Redux', state.numberOfDocs);
    },
    setNavigationStatus: (state, action) => {
      // Step 2: Add the new action to update navigationStatus
      state.navigationStatus = action.payload;
      // console.log('Navigation Status Set in Redux', state.navigationStatus);
    },
  },
});

export const {
  setBookingInfoState,
  setNumberOfDocs,
  setCoordinates,
  setUser,
  setNavigationStatus,
} = bookingSlice.actions;

export default bookingSlice.reducer;
