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
    '!src/healthcheck.js'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: [
    'text',
    'lcov',
    'html'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
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