import {useLazyQuery, useMutation} from '@apollo/client';
import {CREATE_SESSION} from '../../request/mutations/createSession.mutation';
import {UPDATE_SESSION} from '../../request/mutations/updateSession.mutation';
import {ADD_OBSERVERS} from '../../request/mutations/inviteObservers.mutation';
import {GET_SESSION_BY_ID} from '../../request/queries/getSessionByID.query';

export const useSession = () => {
  const [createSession] = useMutation(CREATE_SESSION);
  const [inviteObservers] = useMutation(ADD_OBSERVERS);
  const [getSession] = useLazyQuery(GET_SESSION_BY_ID);
  const handleSessionCreation = async (
    urlResponse,
    selectedClient,
    session,
    date,
    selected,
    observerEmail,
    totalPrice,
    documentObjects,
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
      },
    };
    const response = await createSession(request);
    console.log('Session Response', response.data);
    return response.data.createSessionR.status;
  };
  const handleSessionUpdation = async () => {};
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

  return {
    handleSessionCreation,
    handleSessionUpdation,
    handleAddObservers,
    getSessionByID,
  };
};
