module.exports = {
  testEnvironment: 'node',
  verbose: true,
  maxWorkers: 1, // Run tests sequentially to prevent database interference
  setupFiles: ['dotenv/config'],
  setupFilesAfterEnv: [
    '<rootDir>/test/setup.js'
  ],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server.js',
    '!src/healthcheck.js',
    '!**/node_modules/**',
    '!**/coverage/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: [
    'text',
    'lcov',
    'html'
  ],
  coverageThreshold: {
    global: {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85
    }
  },
  testMatch: [
    '**/test/**/*.test.js',
    '**/test/**/*.spec.js'
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/coverage/'
  ]
}; 