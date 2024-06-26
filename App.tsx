/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */
import React, { useEffect, useState } from 'react';
import { ApolloProvider } from '@apollo/client';
import { store } from './src/app/store';
import { Provider, useDispatch } from 'react-redux';
import init from './apollo/init';
import { polyfill as polyfillEncoding } from 'react-native-polyfill-globals/src/encoding';
import { polyfill as polyfillReadableStream } from 'react-native-polyfill-globals/src/readable-stream';
import { polyfill as polyfillFetch } from 'react-native-polyfill-globals/src/fetch';
import { StripeProvider } from '@stripe/stripe-react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { initializeOneSignal } from './src/utils/oneSignal';
import Wrapper from './src/routes/Root';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { EventRegister } from 'react-native-event-listeners';
import { setNotification } from './src/features/user/userSlice';

polyfillReadableStream();
polyfillEncoding();
polyfillFetch();

const client = init();

initializeOneSignal();
// const OneSignalHandler = () => {
// const dispatch = useDispatch();

// useEffect(() => {


// const listener = EventRegister.addEventListener('notification', notification => {
//   dispatch(setNotification(notification));
// });

// return () => {
//   EventRegister.removeEventListener(listener);
// };
// }, [dispatch]);

//   return null;
// }
function App(): JSX.Element {

  const publishableKey = 'pk_test_FSxGM2WbrX0AZFSi8KLj9s4D00IxKQrrDI';
  // useEffect(() => {
  //   initializeOneSignal();

  //   const listener = EventRegister.addEventListener('notification', notification => {
  //     store.dispatch(setNotification(notification));
  //   });

  //   return () => {
  //     EventRegister.removeEventListener(listener);
  //   };
  // }, []);

  return (
    <ApolloProvider client={client}>
      <Provider store={store}>
        <StripeProvider publishableKey={publishableKey}>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <BottomSheetModalProvider>
              <Wrapper />
            </BottomSheetModalProvider>
          </GestureHandlerRootView>
        </StripeProvider>
      </Provider>
    </ApolloProvider>
  );
}

export default App;
