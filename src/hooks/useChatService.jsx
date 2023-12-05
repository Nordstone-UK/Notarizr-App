import {useLazyQuery, useMutation} from '@apollo/client';
import {CREATE_CHAT} from '../../request/mutations/createChat.mutation';
import {GET_ALL_CHATS} from '../../request/queries/getAllChats.query';
import {GET_ALL_MESSAGES} from '../../request/queries/getAllMessages.query';

function useChatService() {
  const [createChat] = useMutation(CREATE_CHAT);
  const [getallchats] = useLazyQuery(GET_ALL_CHATS);
  const [getAllMessages] = useLazyQuery(GET_ALL_MESSAGES);
  const createChatWithUser = async id => {
    const request = {
      variables: {
        userId: id,
      },
    };

    const response = await createChat(request);

    // console.log('Chat response', response.data);
  };

  const getAllChats = async () => {
    const response = await getallchats();
    // console.log('====================================');
    // console.log(response.data.getAllChat[0].users);
    // console.log('====================================');
    return response.data;
  };
  const handleGetMessages = async id => {
    const request = {
      variables: {
        chatId: id,
      },
    };
    const response = await getAllMessages(request);

    return response.data;
  };
  return {createChatWithUser, getAllChats, handleGetMessages};
}

export default useChatService;
