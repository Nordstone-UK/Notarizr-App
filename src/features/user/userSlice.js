import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  user: null,
  LiveCoordinates: null,
  socketID: null,
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
      console.log('Redux coordinates', state.socketID);
    },
  },
});

export const {saveUserInfo, setLiveCoordinates, setSocketID} =
  userSlice.actions;

export default userSlice.reducer;
