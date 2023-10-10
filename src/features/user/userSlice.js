import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  user: {
    _id: '651e8cd295d5a3744b7e3271',
    first_name: 'Abdul',
    last_name: 'Hadi',
    email: 'hadi2408466@gmail.com',
    phone_number: '+447893983412',
    profile_picture:
      'https://notarizr-app-data.s3.amazonaws.com/images/Profile%20Pictures/6d928174-497b-4d5b-8e32-3bdebd465ae9.JPEG',
    gender: 'male',
    isBlocked: false,
    chatPrivacy: false,
    location: 'London',
    subscriptionType: 'free',
    isVerified: true,
    account_type: 'client',
  },
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    saveUserInfo: (state, action) => {
      state.user = action.payload;
      console.log(state.user);
    },
  },
});

export const {saveUserInfo} = userSlice.actions;

export default userSlice.reducer;
