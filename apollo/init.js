import {
  ApolloClient,
  HttpLink,
  InMemoryCache,
  createHttpLink,
  from,
} from '@apollo/client';
import {setContext} from 'apollo-link-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DEV_LIVE = 'http://35.171.240.48:8080/api/v1/app';
// const DEV_LOCAL = 'http://localhost:8080/api/v1/app/';

const defaultOptions = {
  watchQuery: {
    fetchPolicy: 'no-cache',
    errorPolicy: 'ignore',
  },
  query: {
    fetchPolicy: 'no-cache',
    errorPolicy: 'all',
  },
};
const init = () => {
  const httpLink = new HttpLink({
    uri: DEV_LIVE,
    fetchOptions: {
      reactNative: {textStreaming: true},
    },
  });
  const authLink = setContext((_, {headers}) => {
    const token = AsyncStorage.getItem('token')
      ? AsyncStorage.getItem('token')
      : ''; // Return the headers object with the Authorization header
    return {
      headers: {
        ...headers,
        authorization: token ? `Bearer ${token}` : '',
      },
    };
  });

  const hLink = authLink.concat(httpLink);

  const init = new ApolloClient({
    link: hLink,
    cache: new InMemoryCache(),
    defaultOptions: defaultOptions,
  });
  return init;
};

export default init;
