/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */
import PermissionsAndroid from 'react-native';
import React, {useEffect, useState} from 'react';
import {ApolloClient, InMemoryCache, ApolloProvider, gql} from '@apollo/client';
import AppNavigation from './src/screens/Navigation/AppNavigation';
import {store} from './src/app/store';
import {Provider} from 'react-redux';
import init from './apollo/init';
import {polyfill as polyfillEncoding} from 'react-native-polyfill-globals/src/encoding';
import {polyfill as polyfillReadableStream} from 'react-native-polyfill-globals/src/readable-stream';
import {polyfill as polyfillFetch} from 'react-native-polyfill-globals/src/fetch';
import {StripeProvider} from '@stripe/stripe-react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';

polyfillReadableStream();
polyfillEncoding();
polyfillFetch();

const client = init();

function App(): JSX.Element {
  const publishableKey = 'pk_test_FSxGM2WbrX0AZFSi8KLj9s4D00IxKQrrDI';

  return (
    <ApolloProvider client={client}>
      <Provider store={store}>
        <StripeProvider
          publishableKey={publishableKey}
          // merchantIdentifier="merchant.identifier" // required for Apple Pay
          // urlScheme="your-url-scheme" // required for 3D Secure and bank redirects
        >
          <GestureHandlerRootView style={{flex: 1}}>
            <AppNavigation />
          </GestureHandlerRootView>
        </StripeProvider>
      </Provider>
    </ApolloProvider>
  );
}

export default App;
