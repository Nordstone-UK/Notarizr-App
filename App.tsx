/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */
import React, { useEffect, useState } from 'react';
import SoundPlayer from 'react-native-sound-player';

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

// const initializePushNotification = () => {
//   if (PushNotification) {
//     PushNotification.createChannel(
//       {
//         channelId: 'voice-call', // Unique ID
//         channelName: 'Voice Call Notifications', // Visible name
//         importance: 4, // Max importance
//         soundName: 'ringtone', // Custom sound
//         vibrate: true,
//       },
//       created => console.log(`Channel created: ${created}`)
//     );

//     PushNotification.configure({
//       onNotification: function (notification) {
//         console.log('PushNotification received:', notification);

//         if (notification.foreground) {
//           // App is in the foreground
//           if (notification?.data?.type === 'voice_call' && notification?.data?.callStatus === 'ringing') {
//             playRingtone();
//           }
//         } else {
//           // App is in the background or killed
//           if (notification?.data?.type === 'voice_call' && notification?.data?.callStatus === 'ringing') {
//             PushNotification.localNotification({
//               channelId: 'voice-call',
//               title: 'Incoming Call',
//               message: 'You have an incoming voice call',
//               actions: ['Answer', 'Decline'],
//               soundName: 'ringtone.mp3',
//             });
//           }
//         }
//       },
//       onAction: function (notification) {
//         console.log('Notification action clicked:', notification.action);
//         if (notification.action === 'Answer') {
//           stopRingtone();
//           // Handle call answer logic
//         } else if (notification.action === 'Decline') {
//           stopRingtone();
//           // Handle call decline logic
//         }
//       },
//       permissions: {
//         alert: true,
//         badge: true,
//         sound: true,
//       },
//       popInitialNotification: true,
//       requestPermissions: Platform.OS === 'ios',
//     });


//   } else {
//     console.warn("PushNotification is not initialized.");
//   }
// };

// const playRingtone = () => {
//   try {
//     SoundPlayer.playSoundFile('ringtone', 'mp3'); // Ensure the file exists in `android/app/src/main/res/raw/`
//     console.log('Ringtone playing...');
//   } catch (error) {
//     console.error('Error playing sound:', error);
//   }
// };

// const stopRingtone = () => {
//   try {
//     SoundPlayer.stop();
//     console.log('Ringtone stopped');
//   } catch (error) {
//     console.error('Error stopping sound:', error);
//   }
// };
// initializePushNotification();
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
