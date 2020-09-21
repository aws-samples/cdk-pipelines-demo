module.exports = {
  roots: [
    '<rootDir>/test',
    '<rootDir>/integration_test',
  ],
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  }
};
