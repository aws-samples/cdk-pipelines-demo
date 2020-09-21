module.exports = {
  roots: [
    '<rootDir>/integration_test',
  ],
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  }
};
