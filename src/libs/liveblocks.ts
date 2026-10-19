import {decode} from 'base-64';
import {createClient} from '@liveblocks/client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {BaseURL} from '../utils/ApiUtils';

const liveblocksAuthUrl = BaseURL.replace(
  /\/api\/v1\/app\/?$/,
  '/api/v1/liveblocks-auth',
);

export const client = createClient({
  authEndpoint: async room => {
    const token = await AsyncStorage.getItem('token');
    if (!token || token.startsWith('local-preview:')) {
      return {error: 'forbidden', reason: 'Sign in to access this document.'};
    }

    const response = await fetch(liveblocksAuthUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({room}),
    });
    return response.json();
  },
  throttle: 32,
  polyfills: {
    atob: decode,
  },
});
