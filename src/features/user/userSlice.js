import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  user: null,
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    saveUserInfo: (state, action) => {
      state.user = action.payload;
      // console.log(state.user);
    },
  },
});

export const {saveUserInfo} = userSlice.actions;

export default userSlice.reducer;
