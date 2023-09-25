import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  firstName: 'none',
  lastName: 'none',
  email: 'none',
  phoneNumber: 'none',
  gender: '',
  dateOfBirth: 'none',
  profilePicture: 'none',
  certificateUrl: 'none',
  photoId: 'none',
  accountType: 'none',
};

export const registerSlice = createSlice({
  name: 'state',
  initialState,
  reducers: {
    emailSet: (state, action) => {
      state.email = action.payload;
      console.log('Redux email', state.email);
    },
    ceredentailSet: (state, action) => {
      state.email = action.payload.email;
      state.firstName = action.payload.firstName;
      state.lastName = action.payload.lastName;
      state.phoneNumber = action.payload.number;
      console.log('Redux ', state);
    },
    accountTypeSet: (state, action) => {
      state.accountType = action.payload;
    },
  },
});

export const {emailSet, ceredentailSet, accountTypeSet} = registerSlice.actions;

export default registerSlice.reducer;
