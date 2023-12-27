/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */
import React, {useEffect, useState} from 'react';
import {ApolloProvider} from '@apollo/client';
import {store} from './src/app/store';
import {Provider} from 'react-redux';
import init from './apollo/init';
import {polyfill as polyfillEncoding} from 'react-native-polyfill-globals/src/encoding';
import {polyfill as polyfillReadableStream} from 'react-native-polyfill-globals/src/readable-stream';
import {polyfill as polyfillFetch} from 'react-native-polyfill-globals/src/fetch';
import {StripeProvider} from '@stripe/stripe-react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {initializeOneSignal} from './src/utils/oneSignal';
import Wrapper from './src/routes/Root';

polyfillReadableStream();
polyfillEncoding();
polyfillFetch();

const client = init();
initializeOneSignal();

function App(): JSX.Element {
  const publishableKey = 'pk_test_FSxGM2WbrX0AZFSi8KLj9s4D00IxKQrrDI';

  return (
    <ApolloProvider client={client}>
      <Provider store={store}>
        <StripeProvider publishableKey={publishableKey}>
          <GestureHandlerRootView style={{flex: 1}}>
            <Wrapper />
          </GestureHandlerRootView>
        </StripeProvider>
      </Provider>
    </ApolloProvider>
  );
}

export default App;
