/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import {ApolloClient, InMemoryCache, ApolloProvider, gql} from '@apollo/client';
import AppNavigation from './src/screens/Navigation/AppNavigation';
import {store} from './src/app/store';
import {Provider} from 'react-redux';
import init from './apollo/init';
import {polyfill as polyfillEncoding} from 'react-native-polyfill-globals/src/encoding';
import {polyfill as polyfillReadableStream} from 'react-native-polyfill-globals/src/readable-stream';
import {polyfill as polyfillFetch} from 'react-native-polyfill-globals/src/fetch';
import Geolocation from '@react-native-community/geolocation';
import {SafeAreaView} from 'react-native';

polyfillReadableStream();
polyfillEncoding();
polyfillFetch();
const client = init();
// Geolocation.getCurrentPosition(info => console.log(info));

function App(): JSX.Element {
  return (
    <ApolloProvider client={client}>
      <Provider store={store}>
        <AppNavigation />
      </Provider>
    </ApolloProvider>
  );
}

export default App;
