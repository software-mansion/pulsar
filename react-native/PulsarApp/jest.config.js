module.exports = {
  preset: '@react-native/jest-preset',
  setupFiles: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '\\.(mp3|wav|pulsar)$': '<rootDir>/test/fileMock.js',
  },
};
