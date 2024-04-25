import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  signatures: [],
};

export const signatureSlice = createSlice({
  name: 'signature',
  initialState,
  reducers: {
    addSignature: (state, action) => {
      state.signatures.push({data: action.payload});
      console.log('Signature added:', action.payload);
    },
  },
});

export const {addSignature} = signatureSlice.actions;

export default signatureSlice.reducer;
