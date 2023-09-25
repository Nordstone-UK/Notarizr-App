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
const client = init();

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
