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

const defaultOptions = {
  watchQuery: {
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'ignore',
  },
  query: {
    fetchPolicy: 'network-only',
    errorPolicy: 'all',
  },
  mutate: {
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
  const authLink = setContext(async (_, {headers}) => {
    // Retrieve the token from AsyncStorage
    const token = await AsyncStorage.getItem('token');

    return {
      headers: {
        ...headers,
        authorization: token ? `Bearer ${token}` : '',
      },
    };
  });

  const hLink = from([authLink, httpLink]);

  const init = new ApolloClient({
    link: hLink,
    cache: new InMemoryCache(),
    defaultOptions: defaultOptions,
  });
  return init;
};

export default init;
