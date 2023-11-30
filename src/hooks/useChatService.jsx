import {useLazyQuery, useMutation} from '@apollo/client';
import {CREATE_CHAT} from '../../request/mutations/createChat.mutation';
import {GET_ALL_CHATS} from '../../request/queries/getAllChats.query';

function useChatService() {
  const [createChat] = useMutation(CREATE_CHAT);
  const [getallchats] = useLazyQuery(GET_ALL_CHATS);
  const createChatWithUser = async id => {
    const request = {
      variables: {
        userId: id,
      },
    };

    const response = await createChat(request);

    console.log('Chat response', response.data);
  };

  const getAllChats = async () => {
    const response = await getallchats();
    return response.data;
  };

  return {createChatWithUser, getAllChats};
}

export default useChatService;
