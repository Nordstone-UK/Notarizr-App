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
    errorPolicy: 'ignore',
    fetchPolicy: 'no-cache',
  },
  query: {
    errorPolicy: 'all',
    fetchPolicy: 'no-cache',
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
    const token =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySUQiOiI2NTFlOGNkMjk1ZDVhMzc0NGI3ZTMyNzEiLCJpYXQiOjE2OTY1MjQzNDR9.l7xbEr-B3kcqxK56vjvY_yeJKRNYLHu-rOHgiAe-_lk';
    // await AsyncStorage.getItem('token');
    // console.log(token);
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
