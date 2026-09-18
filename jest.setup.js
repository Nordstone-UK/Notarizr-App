jest.mock(
  '@react-native-async-storage/async-storage',
  () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

jest.mock('@react-native-community/geolocation', () => ({
  getCurrentPosition: jest.fn(),
  watchPosition: jest.fn(),
  clearWatch: jest.fn(),
  stopObserving: jest.fn(),
}));

jest.mock('@stripe/stripe-react-native', () => {
  const React = require('react');
  return {
    StripeProvider: ({children}) => React.createElement(React.Fragment, null, children),
  };
});

jest.mock('react-native-onesignal', () => ({
  initialize: jest.fn(),
  Notifications: {
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    requestPermission: jest.fn(),
  },
}));

jest.mock('react-native-sound-player', () => ({
  playSoundFile: jest.fn(),
  stop: jest.fn(),
}));

jest.mock('react-native-event-listeners', () => ({
  EventRegister: {
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    emit: jest.fn(),
  },
}));

jest.mock('react-native-fs', () => ({
  DocumentDirectoryPath: '/tmp',
  CachesDirectoryPath: '/tmp',
  readFile: jest.fn(),
  writeFile: jest.fn(),
  unlink: jest.fn(),
}));

jest.mock('react-native-image-picker', () => ({
  launchCamera: jest.fn(),
  launchImageLibrary: jest.fn(),
}));

jest.mock('react-native-blob-util', () => ({
  Blob: jest.fn(),
}));
