import {ApolloClient, HttpLink, InMemoryCache, from} from '@apollo/client';
import {Platform} from 'react-native';
import {setContext} from 'apollo-link-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Geolocation from '@react-native-community/geolocation';
import {BaseURL} from '../src/utils/ApiUtils';

const DEV_LIVE = BaseURL;
//'http://3.13.41.233:8080/api/v1/app';

const defaultOptions = {
  watchQuery: {
    errorPolicy: 'all',
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first',
  },
  query: {
    errorPolicy: 'all',
    fetchPolicy: 'cache-first',
  },
  mutate: {
    errorPolicy: 'all',
  },
};

const init = () => {
  const httpLink = new HttpLink({
    uri: DEV_LIVE,
    timeout: 10000,
    fetchOptions: {
      reactNative: {textStreaming: true},
    },
  });

  const authLink = setContext(async (_, {headers}) => {
    const token = await AsyncStorage.getItem('token');
    const location = getRequestLocation();
    return {
      headers: {
        ...headers,
        authorization: token ? `Bearer ${token}` : '',
        'X-User-Coordinates':
          location?.latitude && location?.longitude
            ? `${location?.longitude},${location?.latitude}`
            : '-119.417931,36.778259',
      },
    };
  });

  const hLink = from([authLink, httpLink]);

  const client = new ApolloClient({
    link: hLink,
    cache: new InMemoryCache(),
    defaultOptions: defaultOptions,
  });
  return client;
};

const DEFAULT_LOCATION = {latitude: 36.778259, longitude: -119.417931};
const LOCATION_CACHE_MS = 60000;
let cachedLocation = DEFAULT_LOCATION;
let locationUpdatedAt = 0;
let locationRequest = null;

const getRequestLocation = () => {
  if (!locationRequest && Date.now() - locationUpdatedAt > LOCATION_CACHE_MS) {
    locationRequest = getCurrentLocation()
      .then(location => {
        cachedLocation = location;
        locationUpdatedAt = Date.now();
      })
      .finally(() => {
        locationRequest = null;
      });
  }

  return cachedLocation;
};

const getCurrentLocation = () => {
  return new Promise(async (resolve, reject) => {
    try {
      // resolve({latitude: 36.778259, longitude: -119.417931});
      // return;
      Geolocation.getCurrentPosition(
        position => {
          const {latitude, longitude} = position.coords;
          resolve({latitude, longitude});
        },
        error => {
          // reject(error);
          resolve(DEFAULT_LOCATION);
        },
        Platform.OS === 'android'
          ? {}
          : {enableHighAccuracy: false, timeout: 3000, maximumAge: 60000},
      );
    } catch (error) {
      // reject(error);
      resolve(DEFAULT_LOCATION);
    }
  });
};

export default init;
