# Backend Integration Tests

This directory contains integration tests for the backend application, testing the interaction between different components and external dependencies.

## Structure

The integration tests follow the same structure as the `src` directory:

```
test/integration/
├── routes/           # API route integration tests
├── middlewares/      # Middleware integration tests
├── models/          # Database model integration tests
├── utils/           # Utility function integration tests
└── README.md        # This file
```

## Test Categories

### Routes Integration Tests
- **Purpose**: Test complete API endpoints with real HTTP requests
- **Scope**: Full request/response cycle, authentication, validation
- **Tools**: Supertest, Express app instance
- **Examples**: 
  - `authRoutes.integration.test.js` - Authentication flow
  - `taskRoutes.integration.test.js` - CRUD operations

### Middleware Integration Tests
- **Purpose**: Test middleware in the context of Express requests
- **Scope**: Authentication, error handling, request processing
- **Tools**: Supertest, Express app with middleware
- **Examples**:
  - `authMiddleware.integration.test.js` - JWT authentication

### Models Integration Tests
- **Purpose**: Test database operations and model relationships
- **Scope**: CRUD operations, data validation, relationships
- **Tools**: Mongoose, test database
- **Examples**:
  - `User.integration.test.js` - User model operations
  - `Task.integration.test.js` - Task model operations

### Utils Integration Tests
- **Purpose**: Test utility functions in real application context
- **Scope**: Error handling, data processing, helper functions
- **Tools**: Express app, real error scenarios
- **Examples**:
  - `errorHandler.integration.test.js` - Error handling middleware

## Running Integration Tests

```bash
# Run all integration tests
npm run test:integration

# Run specific integration test category
npm test -- --testPathPattern="integration/routes"

# Run with coverage
npm test -- --testPathPattern="integration" --coverage
```

## Best Practices

### 1. Database Setup
- Use a separate test database
- Clean up data between tests
- Use transactions when possible
- Mock external services

### 2. Test Structure
```javascript
describe('Feature Integration Tests', () => {
  beforeEach(async () => {
    // Setup test data
    await User.deleteMany({});
  });

  afterEach(async () => {
    // Cleanup
    await User.deleteMany({});
  });

  describe('Success Scenarios', () => {
    // Test happy path
  });

  describe('Error Scenarios', () => {
    // Test error conditions
  });
});
```

### 3. Authentication Testing
- Test with valid tokens
- Test with invalid tokens
- Test with expired tokens
- Test without tokens

### 4. Error Handling
- Test network errors
- Test validation errors
- Test server errors
- Test authentication errors

### 5. Data Validation
- Test valid data
- Test invalid data
- Test missing required fields
- Test data type validation

## Test Data Management

### Fixtures
Create reusable test data:

```javascript
const testUser = {
  email: 'test@example.com',
  password: '123456'
};

const testTask = {
  title: 'Test Task',
  description: 'Test Description',
  completed: false
};
```

### Factories
Use factory functions for dynamic test data:

```javascript
const createTestUser = (overrides = {}) => ({
  email: `test${Date.now()}@example.com`,
  password: '123456',
  ...overrides
});
```

## Environment Setup

Ensure your test environment is properly configured:

```bash
# .env.test
NODE_ENV=test
MONGODB_URI=mongodb://localhost:27017/test
JWT_SECRET=test-secret
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

## Troubleshooting

### Common Issues

1. **Database Connection**: Ensure test database is running
2. **Port Conflicts**: Use different ports for test server
3. **Async Operations**: Use proper async/await patterns
4. **Cleanup**: Always clean up test data

### Debug Mode

Run tests in debug mode:

```bash
npm test -- --testPathPattern="integration" --verbose --detectOpenHandles
``` 