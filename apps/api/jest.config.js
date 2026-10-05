module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': ['ts-jest', { tsconfig: '<rootDir>/../tsconfig.jest.json' }],
  },
  // @nestjs/jwt v12 ships ES modules; transform it so tests exercise the real library, not a mock.
  transformIgnorePatterns: [
    '/node_modules/(?!.*(@nestjs[/+]jwt|jose|google-auth-library|gaxios|google-logging-utils|gtoken))',
  ],
  moduleNameMapper: {
    '^@know-your-route/contracts$': '<rootDir>/../../../packages/contracts/src/index.ts',
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
};
