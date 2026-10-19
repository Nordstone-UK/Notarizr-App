module.exports = {
  preset: 'react-native',
  setupFiles: ['./jest.setup.js'],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|react-native-polyfill-globals)/)',
  ],
  moduleNameMapper: {
    '^react-native-vector-icons/.+$': '<rootDir>/__mocks__/IconMock.js',
  },
};
