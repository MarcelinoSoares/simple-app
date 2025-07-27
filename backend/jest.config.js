module.exports = {
  testEnvironment: 'node',
  verbose: true,
  setupFiles: ['dotenv/config'],
  setupFilesAfterEnv: [
    '<rootDir>/test/setup.js'
  ],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server.js'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: [
    'text',
    'lcov',
    'html'
  ]
}; 