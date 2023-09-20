/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';

import AppNavigation from './src/screens/Navigation/AppNavigation';
import {store} from './src/app/store';
import {Provider} from 'react-redux';
function App(): JSX.Element {
  return (
    <Provider store={store}>
      <AppNavigation />
    </Provider>
  );
}

export default App;
