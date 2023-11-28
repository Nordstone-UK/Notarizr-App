import {useMutation} from '@apollo/client';
import {CREATE_SESSION} from '../../request/mutations/createSession.mutation';
import {UPDATE_SESSION} from '../../request/mutations/updateSession.mutation';

export const useSession = () => {
  const [createSession] = useMutation(CREATE_SESSION);
  const [updateSession] = useMutation(UPDATE_SESSION);

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
    console.log(response.data);
    return response.data.createSessionR.status;
  };

  const handleSessionUpdation = () => {};

  return {handleSessionCreation, handleSessionUpdation};
};
