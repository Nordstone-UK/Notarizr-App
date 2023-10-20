const {useMutation} = require('@apollo/client');
const {
  CREATE_SESSION,
} = require('../../request/mutations/createSession.mutation');
const {
  UPDATE_SESSION,
} = require('../../request/mutations/updateSession.mutation');

const useSession = () => {
  const [sessionData, setSessionData] = useState({});
  const createSession = () => {
    const [createSession] = useMutation(CREATE_SESSION);
  };

  const updateSession = () => {
    const [updateSession] = useMutation(UPDATE_SESSION);
  };

  return {createSession, updateSession};
};
