import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  service: false,
};

export const serviceSlice = createSlice({
  name: 'service',
  initialState,
  reducers: {
    serviceCheck: state => {
      state.service = !state.service;
      console.log(state.service);
    },
  },
});

export const {serviceCheck} = serviceSlice.actions;

export default serviceSlice.reducer;
