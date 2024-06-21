import {useLazyQuery, useMutation} from '@apollo/client';
import {CREATE_SESSION} from '../../request/mutations/createSession.mutation';
import {UPDATE_SESSION} from '../../request/mutations/updateSession.mutation';
import {ADD_OBSERVERS} from '../../request/mutations/inviteObservers.mutation';
import {GET_SESSION_BY_ID} from '../../request/queries/getSessionByID.query';
import {UPDATE_SESSION_STATUS} from '../../request/mutations/updateSessionStatus.mutation';
import {CREATE_CLIENTSESSION} from '../../request/mutations/createSessiononClient.mutation';
import {useSelector} from 'react-redux';
import {UPDATE_SESSION_PRICEDOCS} from '../../request/mutations/updateSessionPriceDocs.mutation';

export const useSession = () => {
  const [createSession] = useMutation(CREATE_SESSION);
  const [createClientSession] = useMutation(CREATE_CLIENTSESSION);
  const [inviteObservers] = useMutation(ADD_OBSERVERS);
  const [getSession] = useLazyQuery(GET_SESSION_BY_ID);
  const [updateSessionStatus] = useMutation(UPDATE_SESSION_STATUS);
  const [updateSessionItems] = useMutation(UPDATE_SESSION);
  const [updateSessionReview] = useMutation(UPDATE_SESSION_PRICEDOCS);
  const FinalBookingData = useSelector(state => state.booking.booking);

  const handleSessionCreation = async (
    urlResponse,
    selectedClient,
    session,
    date,
    selected,
    observerEmail,
    totalPrice,
    documentObjects,
    payment_type,
  ) => {
    const request = {
      variables: {
        agentDocument: urlResponse,
        clientEmail: selectedClient,
        sessionSchedule: session,
        dateTimeSession: date,
        identityAuthentication: selected,
        observers: observerEmail,
        price: totalPrice,
        documentType: documentObjects,
        paymentType: payment_type,
      },
    };
    console.log('requestssss', request);
    const response = await createSession(request);
    console.log('Session Response', response.data.createSessionR.session);
    return response.data.createSessionR.status;
  };

  const handleAddObservers = async (id, email) => {
    const request = {
      variables: {
        observers: email,
        bookingId: id,
      },
    };

    const response = await inviteObservers(request);
    console.log('====================================');
    console.log(response.data);
    console.log('====================================');
    return response.data.inviteObservers;
  };
  const getSessionByID = async id => {
    const requets = {
      variables: {
        sessionId: id,
      },
    };
    try {
      const {data} = await getSession(requets);
      return data?.getSession?.session;
    } catch (error) {
      console.error(error);
    }
  };
  const updateSession = async (updatedStatus, id) => {
    const request = {
      variables: {
        sessionId: id,
        status: updatedStatus,
      },
    };
    const response = await updateSessionStatus(request);
    console.log(response?.updateSessionStatus?.status);
  };
  const handleClientSessionCreation = async (selectedAgent, session, date) => {
    const request = {
      variables: {
        agentEmail: selectedAgent,
        sessionSchedule: session,
        dateTimeSession: date,
      },
    };
    console.log('reques', request);
    const response = await createClientSession(request);
    return response.data.createSessionClientR;
  };
  const handleSessionUpdation = async params => {
    const {sessionId, identityAuthentication, observers, paymentType} = params;

    const request = {
      variables: {
        sessionId,
        identityAuthentication,
        observers,
        paymentType,
      },
    };
    console.log('reqeustrdfdfdfdfdfdf', request);
    const response = await updateSessionItems(request);
    console.log('dddddddddddddddddddddddddddddd', response);
    return response.data.updateSessionR;
  };
  //  const handleUpdateSessionReview = async params => {
  //    const {sessionId, review,rating} = params;

  //    const request = {
  //      variables: {
  //        sessionId,
  //        identityAuthentication,
  //        observers,
  //        paymentType,
  //      },
  //    };
  //    console.log('reqeustrdfdfdfdfdfdf', request);
  //    const response = await updateSessionItems(request);
  //    console.log('dddddddddddddddddddddddddddddd', response);
  //    return response.data.updateSessionR;
  //  };
  const handleUpdateSessionReview = async (id, review, rating) => {
    const request = {
      variables: {
        sessionId: id,
        review: review,
        rating: rating,
      },
    };
    try {
      console.log('reqeusrere', request);
      const response = await updateSessionReview(request);
      console.log('====================================');
      console.log('Documents and Notes', response);
      console.log('====================================');
      return response.data.updateBookingsInfo.status;
    } catch (error) {
      console.log(error);
    }
  };
  return {
    handleSessionCreation,
    handleSessionUpdation,
    handleAddObservers,
    getSessionByID,
    updateSession,
    handleClientSessionCreation,
    handleUpdateSessionReview,
  };
};
