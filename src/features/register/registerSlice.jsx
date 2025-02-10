import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  firstName: 'none',
  lastName: 'none',
  email: 'none',
  phoneNumber: 'none',
  profilePicture: 'none',
  certificateUrl: 'none',
  photoId: 'none',
  accountType: 'client',
  location: 'none',
  progress: 0,
  filledCount: 0,
};

export const registerSlice = createSlice({
  name: 'state',
  initialState,
  reducers: {
    emailSet: (state, action) => {
      state.email = action.payload;
      // console.log('Redux email', state.email);
    },
    phoneSet: (state, action) => {
      state.phoneNumber = action.payload;
      // console.log('Redux email', state.email);
    },
    ceredentailSet: (state, action) => {
      state.email = action.payload.email;
      state.firstName = action.payload.firstName;
      state.lastName = action.payload.lastName;
      state.phoneNumber = action.payload.phoneNumber;
      state.gender = action.payload.gender;
      state.location = action.payload.location;
      state.dateOfBirth = action.payload.date;
      state.description = action.payload.description;
      // console.log('Redux ', state);
    },
    profilePictureSet: (state, action) => {
      state.profilePicture = action.payload;
      // console.log('Redux profilePciture', state);
    },
    accountTypeSet: (state, action) => {
      state.accountType = action.payload;
      // console.log('Redux accountType', state.accountType);
    },
    setProgress: (state, action) => {
      state.progress = action.payload;
    },
    setFilledCount: (state, action) => {
      state.filledCount = action.payload;
    },
  },
});

export const {
  emailSet,
  phoneSet,
  ceredentailSet,
  profilePictureSet,
  accountTypeSet,
  setProgress,
  setFilledCount,
} = registerSlice.actions;

export default registerSlice.reducer;
