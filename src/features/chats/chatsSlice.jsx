import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  allChats: null,
  chatToken: null,
};

export const chatsSlice = createSlice({
  name: 'chats',
  initialState,
  reducers: {
    setAllChats: (state, action) => {
      state.allChats = action.payload;
      // console.log('Chats Set in Redux', state.allChats);
    },
    setChatToken: (state, action) => {
      state.chatToken = action.payload;
      // console.log('Chats Set in Redux', state.chatToken);
    },
  },
});

export const {setAllChats, setChatToken} = chatsSlice.actions;

export default chatsSlice.reducer;
