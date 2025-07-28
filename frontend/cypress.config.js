import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173', // Vite default port
    specPattern: 'test/e2e/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'test/e2e/support/e2e.js',
    fixturesFolder: 'test/e2e/fixtures',
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    experimentalModifyObstructiveThirdPartyCode: true,
  },
  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',
    },
  },
  env: {
    snapshot: {
      // Snapshot configuration
      threshold: 0.1, // 10% threshold for visual differences
      updateSnapshots: false, // Set to true to update snapshots
    },
  },
}) 