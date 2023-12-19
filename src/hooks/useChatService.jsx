import {useLazyQuery, useMutation} from '@apollo/client';
import {CREATE_CHAT} from '../../request/mutations/createChat.mutation';
import {GET_ALL_CHATS} from '../../request/queries/getAllChats.query';
import {GET_ALL_MESSAGES} from '../../request/queries/getAllMessages.query';
import {GET_CLIENT_BOOKING_CHAT} from '../../request/queries/getClientBookingChat.query';
import {GET_CLIENT_SESSION_CHAT} from '../../request/queries/getClientSessionChat.query';
import {useDispatch} from 'react-redux';
import {setAllChats, setChatToken} from '../features/chats/chatsSlice';
import {GET_CHAT_TOKEN} from '../../request/mutations/getUserChatToken.mutation';
import {GET_AGENT_BOOKING_CHAT} from '../../request/queries/getAgentBookingChat.query';
import {GET_AGENT_SESSION_CHAT} from '../../request/queries/getAgentSessionChat.query';

function useChatService() {
  const [createChat] = useMutation(CREATE_CHAT);
  const [getallchats] = useLazyQuery(GET_ALL_CHATS);
  const [getAllMessages] = useLazyQuery(GET_ALL_MESSAGES);
  const [getClientBooking] = useLazyQuery(GET_CLIENT_BOOKING_CHAT);
  const [getClientSession] = useLazyQuery(GET_CLIENT_SESSION_CHAT);
  const [getAgentBooking] = useLazyQuery(GET_AGENT_BOOKING_CHAT);
  const [getAgentSession] = useLazyQuery(GET_AGENT_SESSION_CHAT);
  const [getChatToken] = useMutation(GET_CHAT_TOKEN);
  const dispatch = useDispatch();
  const clientBooking = {
    status: 'accepted',
    page: 1,
    pageSize: 50,
  };
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
  const handleGetMessages = async id => {
    const request = {
      variables: {
        chatId: id,
      },
    };
    const response = await getAllMessages(request);

    return response.data;
  };

  const getClientChats = async () => {
    const request = {
      variables: {
        ...clientBooking,
      },
    };
    const ongong = {
      variables: {
        ...clientBooking,
        status: 'ongoing',
      },
    };
    const {data: Clientbook} = await getClientBooking(request);
    const {data: ClientOngoing} = await getClientBooking(ongong);
    const {data: Clientsess} = await getClientSession(request);
    const {data: sessionOngoing} = await getClientSession(ongong);
    const {data} = await getChatToken();
    const bookings = Clientbook?.getClientBookings?.bookings;
    const ongoingBook = ClientOngoing?.getClientBookings?.bookings;
    const sessions = Clientsess?.getClientSessions?.sessions;
    const sessonoging = sessionOngoing?.getClientSessions?.sessions;
    const mergedDetails = [
      ...bookings,
      ...ongoingBook,
      ...sessions,
      ...sessonoging,
    ];

    const filteredChats = removeDuplicatesByAgentName(mergedDetails);

    dispatch(setAllChats(filteredChats));
    dispatch(setChatToken(data?.getUserChatToken?.token));
  };

  const getAgentChats = async () => {
    const request = {
      variables: {
        ...clientBooking,
      },
    };
    const ongong = {
      variables: {
        ...clientBooking,
        status: 'ongoing',
      },
    };
    const {data: AgentBook} = await getAgentBooking(request);
    const {data: AgentOngoing} = await getAgentBooking(ongong);
    const {data: Agnetsess} = await getAgentSession(request);
    const {data: sessionOngoing} = await getAgentSession(ongong);
    const {data} = await getChatToken();
    // console.log('agents', response.data, respond.data);
    const bookings = AgentBook?.getAgentBookings?.bookings;
    const ongoingBook = AgentOngoing?.getAgentBookings?.bookings;
    // const sessions = Agnetsess?.getAgentSessions?.sessions || {data: 'null'};
    // const sessonoging = sessionOngoing?.getAgentSessions?.sessions || {
    //   data: 'null',
    // };

    const mergedDetails = [
      ...bookings,
      ...ongoingBook,
      // ...sessions,
      // ...sessonoging,
    ];
    // console.log('merge', mergedDetails);
    const filteredChats = removeDuplicatesByClientName(mergedDetails);
    dispatch(setAllChats(filteredChats));
    dispatch(setChatToken(data?.getUserChatToken?.token));
  };
  const removeDuplicatesByAgentName = array => {
    const uniqueAgents = {};
    const resultArray = [];

    for (const item of array) {
      const agentName = item.agent.first_name + item.agent.last_name;

      // Check if agentName is not in uniqueAgents, add it to uniqueAgents and push the item to the resultArray
      if (!uniqueAgents[agentName]) {
        uniqueAgents[agentName] = true;
        resultArray.push(item);
      }
    }

    return resultArray;
  };
  const removeDuplicatesByClientName = array => {
    const uniqueAgents = {};
    const resultArray = [];

    for (const item of array) {
      const clientName = item.booked_by.first_name + item.booked_by.last_name;

      // Check if clientName is not in uniqueAgents, add it to uniqueAgents and push the item to the resultArray
      if (!uniqueAgents[clientName]) {
        uniqueAgents[clientName] = true;
        resultArray.push(item);
      }
    }

    return resultArray;
  };
  return {
    createChatWithUser,
    getClientChats,
    getAllChats,
    getAgentChats,
    handleGetMessages,
  };
}

export default useChatService;
