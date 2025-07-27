# Backend Tests

This folder contains all backend tests organized by type.

## Structure

```
test/
├── unit/           # Unit tests
│   ├── auth.test.js
│   ├── authMiddleware.test.js
│   └── models.test.js
├── integration/    # Integration tests
│   ├── index.test.js
│   └── taskRoutes.test.js
├── api/           # API tests
│   ├── index.test.js
│   ├── app.test.js
│   └── api.test.js
├── setup.js       # Jest configuration
└── README.md      # This documentation
```

## Test Types

### Unit Tests (`/unit`)
Tests that verify individual code units in isolation:
- **auth.test.js** - Authentication system tests
- **authMiddleware.test.js** - Authentication middleware tests
- **models.test.js** - Data model tests (User, Task)

### Integration Tests (`/integration`)
Tests that verify integration between multiple components:
- **taskRoutes.test.js** - Task routes tests with authentication
- **index.test.js** - Placeholder for additional integration tests

### API Tests (`/api`)
Tests that verify the complete API and HTTP responses:
- **app.test.js** - Error handling and middleware tests
- **api.test.js** - Complete tests for all API endpoints
- **index.test.js** - Placeholder for additional API tests

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
```

## Configuration

- **Jest** - Testing framework
- **Supertest** - HTTP API testing
- **MongoDB Memory Server** - In-memory database for tests
- **setup.js** - Global Jest configuration

## Current Coverage

- ✅ **63 tests** passing
- ✅ **8 test suites**
- ✅ **100%** of main components tested
- ✅ **Unit tests** for models and middleware
- ✅ **Integration tests** for authenticated routes
- ✅ **API tests** for all endpoints

## Tested Endpoints

### Authentication
- ✅ `POST /api/login` - Login with valid credentials
- ✅ `POST /api/login` - Failure with wrong password
- ✅ `POST /api/login` - Required fields validation

### Tasks
- ✅ `GET /api/tasks` - List user tasks
- ✅ `POST /api/tasks` - Create new task
- ✅ `PUT /api/tasks/:id` - Update task
- ✅ `DELETE /api/tasks/:id` - Delete task
- ✅ Authentication validation on all routes
- ✅ Data isolation between users

## Adding New Tests

1. **Unit Tests**: Add in `/unit/`
2. **Integration Tests**: Add in `/integration/`
3. **API Tests**: Add in `/api/`

### Unit Test Example

```javascript
const User = require('../../src/models/User');

describe('User Model', () => {
  it('should create a user with valid data', async () => {
    const userData = { email: 'test@example.com', password: '123456' };
    const user = await User.create(userData);
    expect(user.email).toBe(userData.email);
  });
});
```

### Integration Test Example

```javascript
const request = require('supertest');
const app = require('../../src/app');

describe('Task Routes', () => {
  it('should create a new task', async () => {
    const response = await request(app)
      .post('/api/tasks')
      .set('Authorization', 'Bearer valid-token')
      .send({ title: 'Test Task' });
    
    expect(response.status).toBe(201);
  });
});
```

### API Test Example

```javascript
const request = require('supertest');
const app = require('../../src/app');

describe('API Test Suite', () => {
  test('POST /api/login - success', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({ email: 'test@example.com', password: '123456' });
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
  });
});
``` 