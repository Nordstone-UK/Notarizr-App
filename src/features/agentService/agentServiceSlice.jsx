import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  name: 'null',
  serviceType: 'null',
  category: 'null',
  location: 'null',
  availability: {
    endTime: null,
    startTime: null,
    weekdays: null,
  },
};

export const agentServiceSlice = createSlice({
  name: 'agentService',
  initialState,
  reducers: {
    setServiceType: (state, action) => {
      state.serviceType = action.payload;
      console.log('ServiceType Set', state.serviceType);
    },
    setAvailability: (state, action) => {
      state.availability.weekdays = action.payload.availability;
      state.availability.startTime = action.payload.startTime;
      state.availability.endTime = action.payload.endTime;
      console.log('Availability Set', state.availability);
    },
    setCategories: (state, action) => {
      state.category = action.payload;
      console.log('Categories Set', state.category);
    },
    setServiceLocation: (state, action) => {
      state.location = action.payload;
      console.log('Location Set', state.location);
    },
  },
});

export const {
  setServiceType,
  setAvailability,
  setCategories,
  setServiceLocation,
} = agentServiceSlice.actions;

export default agentServiceSlice.reducer;
