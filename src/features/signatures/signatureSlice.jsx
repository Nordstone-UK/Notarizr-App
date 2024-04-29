import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  signatures: [],
};

export const signatureSlice = createSlice({
  name: 'signature',
  initialState,
  reducers: {
    addSignature: (state, action) => {
      const newSignatureData = action.payload;

      // Check if the signature data already exists in the signatures array
      const existingSignature = state.signatures.find(
        sig => sig.data === newSignatureData,
      );

      if (!existingSignature) {
        // If the signature data is not already in the array, add it
        state.signatures.push({data: newSignatureData});
      } else {
        // If the signature data already exists, you can handle this case or simply skip adding it
        // console.log('Signature data already exists:', newSignatureData);
      }
    },
    deleteSignature: (state, action) => {
      const signatureToRemove = action.payload;
      state.signatures = state.signatures.filter(
        sig => sig.data !== signatureToRemove,
      );
    },
  },
});

export const {addSignature, deleteSignature} = signatureSlice.actions;

export default signatureSlice.reducer;
