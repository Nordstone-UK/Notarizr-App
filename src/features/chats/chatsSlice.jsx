import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  allChats: null,
};

export const chatsSlice = createSlice({
  name: 'chats',
  initialState,
  reducers: {
    setAllChats: (state, action) => {
      state.allChats = action.payload;
      // console.log('Chats Set in Redux', state.allChats);
    },
  },
});

export const {setAllChats} = chatsSlice.actions;

export default chatsSlice.reducer;
