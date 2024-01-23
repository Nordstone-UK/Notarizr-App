import {
  ApolloClient,
  HttpLink,
  InMemoryCache,
  createHttpLink,
  from,
} from '@apollo/client';
import {PermissionsAndroid, Platform} from 'react-native';
import {setContext} from 'apollo-link-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Geolocation from '@react-native-community/geolocation';
import {BaseURL} from '../src/utils/ApiUtils';

const DEV_LIVE = 'http://3.13.41.233:8080/api/v1/app';

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
    timeout: 10000,
    fetchOptions: {
      reactNative: {textStreaming: true},
    },
  });

  const authLink = setContext(async (_, {headers}) => {
    const token = await AsyncStorage.getItem('token');
    const {latitude, longitude} = await getCurrentLocation();
    console.log(token);
    return {
      headers: {
        ...headers,
        authorization: token ? `Bearer ${token}` : '',
        'X-User-Coordinates':
          latitude && longitude ? `${longitude},${latitude}` : '',
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
const requestLocationPermission = async () => {
  if (Platform.OS === 'ios') {
    return Geolocation.requestAuthorization('whenInUse');
  }

  if (Platform.OS === 'android') {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    );

    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      return 'granted';
    } else {
      throw new Error('Location permission denied');
    }
  }

  throw new Error('Unsupported platform');
};

const getCurrentLocation = () => {
  return new Promise(async (resolve, reject) => {
    try {
      Geolocation.getCurrentPosition(
        position => {
          const {latitude, longitude} = position.coords;
          resolve({latitude, longitude});
        },
        error => {
          reject(error);
        },
        Platform.OS === 'android'
          ? {}
          : {enableHighAccuracy: true, timeout: 20000, maximumAge: 10000},
      );
    } catch (error) {
      reject(error);
    }
  });
};

export default init;
