import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  firstName: 'none',
  lastName: 'none',
  email: 'none',
  phoneNumber: 'none',
  gender: '',
  profilePicture: 'none',
  certificateUrl: 'none',
  photoId: 'none',
  accountType: 'client',
  location: 'none',
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
      state.phoneNumber = action.payload.phoneNumber;
      state.gender = action.payload.gender;
      state.location = action.payload.location;
      console.log('Redux ', state);
    },
    profilePictureSet: (state, action) => {
      state.profilePicture = action.payload;
      console.log('Redux profilePciture', state);
    },
    accountTypeSet: (state, action) => {
      state.accountType = action.payload;
      console.log('Redux accountType', state.accountType);
    },
  },
});

export const {emailSet, ceredentailSet, profilePictureSet, accountTypeSet} =
  registerSlice.actions;

export default registerSlice.reducer;
