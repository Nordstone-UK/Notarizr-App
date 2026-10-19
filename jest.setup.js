/* global jest */
import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

jest.mock('@react-native-community/geolocation', () => ({
  getCurrentPosition: jest.fn(),
  watchPosition: jest.fn(),
  clearWatch: jest.fn(),
  stopObserving: jest.fn(),
  setRNConfiguration: jest.fn(),
  requestAuthorization: jest.fn(),
}));

jest.mock('@stripe/stripe-react-native', () => ({
  CardField: 'CardField',
  StripeProvider: ({children}) => children,
  initStripe: jest.fn(),
  presentPaymentSheet: jest.fn(),
  useStripe: () => ({
    confirmPayment: jest.fn(),
    confirmSetupIntent: jest.fn(),
    initPaymentSheet: jest.fn(),
    presentPaymentSheet: jest.fn(),
  }),
}));

jest.mock('react-native-sound-player', () => ({
  playSoundFile: jest.fn(),
  stop: jest.fn(),
}));

jest.mock('react-native-event-listeners', () => ({
  EventRegister: {
    addEventListener: jest.fn(() => 'listener-id'),
    removeEventListener: jest.fn(),
    emit: jest.fn(),
  },
}));

jest.mock('./src/routes/Root', () => {
  const React = require('react');
  const {Text} = require('react-native');
  return function MockRoot() {
    return React.createElement(Text, null, 'Root');
  };
});

jest.mock('@gorhom/bottom-sheet', () => ({
  BottomSheetModalProvider: ({children}) => children,
  BottomSheetModal: 'BottomSheetModal',
  BottomSheetTextInput: 'BottomSheetTextInput',
}));

jest.mock('react-native-gesture-handler', () => {
  const React = require('react');
  const {View} = require('react-native');
  return {
    GestureHandlerRootView: ({children, style}) =>
      React.createElement(View, {style}, children),
    ScrollView: View,
    TextInput: 'TextInput',
    TouchableOpacity: 'TouchableOpacity',
  };
});

jest.mock('react-native-polyfill-globals/src/encoding', () => ({
  polyfill: jest.fn(),
}));

jest.mock('react-native-polyfill-globals/src/readable-stream', () => ({
  polyfill: jest.fn(),
}));

jest.mock('react-native-polyfill-globals/src/fetch', () => ({
  polyfill: jest.fn(),
}));
