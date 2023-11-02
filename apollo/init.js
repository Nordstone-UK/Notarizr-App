import {
  ApolloClient,
  HttpLink,
  InMemoryCache,
  createHttpLink,
  from,
} from '@apollo/client';
import PermissionsAndroid from 'react-native';
import {setContext} from 'apollo-link-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Geolocation from '@react-native-community/geolocation';

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
    fetchOptions: {
      reactNative: {textStreaming: true},
    },
  });
  const authLink = setContext(async (_, {headers}) => {
    const token = await AsyncStorage.getItem('token');
    const {latitude, longitude} = await getCurrentLocation();
    console.log('Coords: ', latitude, longitude);
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
const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      position => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        resolve({latitude, longitude});
      },
      error => {
        reject(error);
      },
      {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
    );
  });
};

const checkLocationPermission = async () => {
  const permissionStatus = await check(
    PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
  );

  switch (permissionStatus) {
    case RESULTS.GRANTED:
      // Location permission is granted
      return;
    case RESULTS.DENIED:
      // Location permission is denied, request it
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'This app requires access to your location.',
            buttonPositive: 'Allow',
          },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          // Location permission granted
          return;
        } else {
          // Location permission denied
          throw new Error('Location permission denied.');
        }
      } catch (error) {
        throw error;
      }
    default:
      throw new Error('Location permission check failed.');
  }
};

export default init;
