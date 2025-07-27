# Frontend Integration Tests

This directory contains integration tests for the React frontend application, testing the interaction between components, context, and external services.

## Structure

The integration tests follow the same structure as the `src` directory:

```
test/integration/
├── components/       # Component integration tests
├── pages/           # Page component integration tests
├── context/         # Context provider integration tests
├── api/             # API service integration tests
├── routes/          # Routing integration tests
├── styles/          # Styling integration tests
└── README.md        # This file
```

## Test Categories

### Pages Integration Tests
- **Purpose**: Test complete page components with all dependencies
- **Scope**: User interactions, API calls, navigation, state management
- **Tools**: React Testing Library, Vitest, Mocked dependencies
- **Examples**: 
  - `LoginPage.integration.test.jsx` - Authentication flow
  - `TodoPage.integration.test.jsx` - CRUD operations

### Components Integration Tests
- **Purpose**: Test component integration with props, context, and events
- **Scope**: Component rendering, user interactions, data flow
- **Tools**: React Testing Library, Component mocks
- **Examples**:
  - Form components with validation
  - List components with data
  - Modal components with state

### Context Integration Tests
- **Purpose**: Test React Context providers and consumers
- **Scope**: State management, data sharing, provider-consumer relationships
- **Tools**: React Testing Library, Context mocks
- **Examples**:
  - `AuthContext.integration.test.jsx` - Authentication state

### API Integration Tests
- **Purpose**: Test API service modules and HTTP interactions
- **Scope**: Request/response handling, error management, data transformation
- **Tools**: Vitest, Fetch/axios mocks
- **Examples**:
  - Authentication API calls
  - CRUD operations
  - Error handling

### Routes Integration Tests
- **Purpose**: Test React Router navigation and route protection
- **Scope**: Route rendering, navigation, authentication guards
- **Tools**: React Testing Library, React Router
- **Examples**:
  - Protected route access
  - Navigation between pages
  - URL parameter handling

### Styles Integration Tests
- **Purpose**: Test CSS integration and responsive behavior
- **Scope**: Class application, responsive design, theme integration
- **Tools**: React Testing Library, CSS testing utilities
- **Examples**:
  - Component styling
  - Responsive breakpoints
  - Theme integration

## Running Integration Tests

```bash
# Run all integration tests
npm run test:integration

# Run specific integration test category
npm test -- --testPathPattern="integration/pages"

# Run with coverage
npm test -- --testPathPattern="integration" --coverage

# Run in watch mode
npm test -- --testPathPattern="integration" --watch
```

## Best Practices

### 1. Component Testing
- Test component rendering with different props
- Test user interactions (clicks, form submissions)
- Test integration with context providers
- Test API calls and data flow
- Test error handling scenarios

### 2. Test Structure
```jsx
describe('ComponentName Integration Tests', () => {
  beforeEach(() => {
    // Setup mocks and test data
  });

  describe('Component Rendering', () => {
    // Test component renders correctly
  });

  describe('User Interactions', () => {
    // Test user interactions
  });

  describe('Data Flow', () => {
    // Test data flow and API integration
  });

  describe('Error Handling', () => {
    // Test error scenarios
  });
});
```

### 3. Mocking Strategy
- Mock external dependencies (API, context, router)
- Use realistic mock data
- Test both success and failure scenarios
- Mock timers for async operations

### 4. User Interaction Testing
- Use `fireEvent` for user actions
- Use `waitFor` for async operations
- Test keyboard interactions
- Test form submissions

### 5. Accessibility Testing
- Use semantic queries (`getByRole`, `getByLabelText`)
- Test keyboard navigation
- Test screen reader compatibility
- Test focus management

## Test Data Management

### Mock Data
Create reusable mock data:

```javascript
const mockUser = {
  id: '1',
  email: 'test@example.com',
  name: 'Test User'
};

const mockTasks = [
  { id: '1', title: 'Task 1', completed: false },
  { id: '2', title: 'Task 2', completed: true }
];
```

### Mock Functions
Use mock functions for external dependencies:

```javascript
const mockLogin = vi.fn();
const mockNavigate = vi.fn();

vi.mock('../../../src/context/AuthContext', () => ({
  useAuth: () => ({
    login: mockLogin,
    isAuthenticated: false
  })
}));
```

## Environment Setup

Ensure your test environment is properly configured:

```javascript
// vitest.config.js
export default {
  test: {
    environment: 'jsdom',
    setupFiles: ['./test/setup.js'],
    globals: true
  }
};
```

## Coverage Goals

- **Statements**: 100%
- **Branches**: 95%+
- **Functions**: 100%
- **Lines**: 100%

## Continuous Integration

Integration tests should run:
- On every pull request
- Before deployment
- In parallel with unit tests
- With proper timeout settings

## Testing Tools

### React Testing Library
```jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
```

### Vitest
```javascript
import { vi, describe, it, expect, beforeEach } from 'vitest';
```

### Mock Service Worker (Optional)
```javascript
import { rest } from 'msw';
import { setupServer } from 'msw/node';
```

## Troubleshooting

### Common Issues

1. **Mock Setup**: Ensure mocks are properly configured
2. **Async Operations**: Use `waitFor` for async state changes
3. **Component Dependencies**: Mock all external dependencies
4. **Test Isolation**: Clean up between tests

### Debug Mode

Run tests in debug mode:

```bash
npm test -- --testPathPattern="integration" --verbose --ui
```

### Performance

- Use `vi.clearAllMocks()` between tests
- Avoid unnecessary re-renders
- Use `React.memo` for expensive components
- Mock heavy operations 