import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  user: null,
  LiveCoordinates: null,
  socketID: null,
  notifications: [],
};
export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    saveUserInfo: (state, action) => {
      state.user = action.payload;
      // console.log(state.user);
    },
    setLiveCoordinates: (state, action) => {
      state.LiveCoordinates = action.payload;
      // console.log('Redux coordinates', state.LiveCoordinates);
    },
    setSocketID: (state, action) => {
      state.socketID = action.payload;
    },
    setNotification: (state, action) => {
      state.notifications.push(action.payload);
    },
  },
});

export const {saveUserInfo, setLiveCoordinates, setSocketID, setNotification} =
  userSlice.actions;

export default userSlice.reducer;
