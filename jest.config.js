module.exports = {
  preset: 'react-native',
  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest',
  },
  setupFiles: [
    './node_modules/react-native-gesture-handler/jestSetup.js',
    './jest.setup.js',
  ],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native.*|@react-native(-community)?)/)',
  ],
  moduleNameMapper: {
    '\\.(png|jpg|jpeg|gif|webp)$': '<rootDir>/jest.assetMock.js',
  },
  testPathIgnorePatterns: ['/node_modules/', '<rootDir>/.claude/worktrees/'],
};
