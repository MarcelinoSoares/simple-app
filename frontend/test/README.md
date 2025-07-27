# Frontend Tests

This folder contains all frontend tests organized by type.

## Structure

```
test/
├── unit/           # Unit tests
│   ├── App.test.jsx
│   ├── LoginPage.test.jsx
│   └── TodoPage.test.jsx
├── integration/    # Integration tests
│   └── index.test.jsx
├── api/           # API tests
│   └── index.test.jsx
├── e2e/           # End-to-end tests
│   └── (Cypress files)
├── setup.js       # Jest configuration
└── README.md      # This documentation
```

## Test Types

### Unit Tests (`/unit`)
Tests that verify individual components in isolation:
- **App.test.jsx** - Main application component tests
- **LoginPage.test.jsx** - Login page tests
- **TodoPage.test.jsx** - Task management page tests

### Integration Tests (`/integration`)
Tests that verify integration between multiple components:
- **index.test.jsx** - Integration tests between components

### API Tests (`/api`)
Tests that verify frontend API calls:
- **index.test.jsx** - HTTP calls tests with Axios

### E2E Tests (`/e2e`)
Tests that verify the complete application flow:
- **Cypress** - End-to-end tests with Cypress

## Commands

```bash
# Run all tests
npm test

# Run only unit tests
npm test -- test/unit

# Run only integration tests
npm test -- test/integration

# Run only API tests
npm test -- test/api

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run E2E tests (Cypress)
npm run cypress:open
npm run cypress:run
```

## Configuration

### Jest
- **setup.js** - Global Jest configuration
- **package.json** - Test scripts and dependencies

### Cypress
- **cypress.config.js** - Cypress configuration
- **cypress/support/** - Custom commands and configurations

## Best Practices

### Unit Tests
- Test components in isolation
- Use mocks for external dependencies
- Verify props, state and events
- Test success and error cases

### Integration Tests
- Test component interaction
- Verify data flow
- Test routing
- Verify context and providers

### API Tests
- Mock HTTP calls
- Test different API responses
- Verify error handling
- Test loading states

### E2E Tests
- Test complete user flows
- Verify UI and interactions
- Test responsiveness
- Use Page Object Model 