import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  user: null,
  LiveCoordinates: null,
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
  },
});

export const {saveUserInfo, setLiveCoordinates} = userSlice.actions;

export default userSlice.reducer;
