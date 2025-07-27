# Test Examples and Best Practices

## Backend Test Examples

### Unit Test Example - Authentication Middleware

```javascript
/**
 * @fileoverview Authentication middleware unit tests
 * @module test/unit/middlewares/authMiddleware.test.js
 */

const jwt = require('jsonwebtoken');
const authMiddleware = require('../../../src/middlewares/authMiddleware');

describe('AuthMiddleware', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = {
      headers: {}
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockNext = jest.fn();
  });

  describe('Valid Token', () => {
    it('should call next() with valid JWT token', () => {
      const token = jwt.sign({ id: '123', email: 'test@example.com' }, 'secret');
      mockReq.headers.authorization = `Bearer ${token}`;

      authMiddleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockReq.user).toBeDefined();
      expect(mockReq.user.id).toBe('123');
    });
  });

  describe('Invalid Token', () => {
    it('should return 401 for missing authorization header', () => {
      authMiddleware(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
    });

    it('should return 401 for expired token', () => {
      const expiredToken = jwt.sign(
        { id: '123', email: 'test@example.com' }, 
        'secret', 
        { expiresIn: '0s' }
      );
      mockReq.headers.authorization = `Bearer ${expiredToken}`;

      authMiddleware(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Token expired' });
    });
  });
});
```

### Integration Test Example - Task API

```javascript
/**
 * @fileoverview Task API integration tests
 * @module test/integration/routes/taskRoutes.test.js
 */

const request = require('supertest');
const app = require('../../../src/app');
const Task = require('../../../src/models/Task');
const { generateToken } = require('../../utils/testHelpers');

describe('Task API Integration', () => {
  let authToken;

  beforeAll(async () => {
    authToken = generateToken({ id: '123', email: 'test@example.com' });
  });

  beforeEach(async () => {
    await Task.deleteMany({});
  });

  describe('GET /api/tasks', () => {
    it('should return user tasks when authenticated', async () => {
      // Arrange
      const task = new Task({
        title: 'Test Task',
        description: 'Test Description',
        userId: '123'
      });
      await task.save();

      // Act
      const response = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].title).toBe('Test Task');
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app).get('/api/tasks');

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/tasks', () => {
    it('should create new task with valid data', async () => {
      const taskData = {
        title: 'New Task',
        description: 'New Description'
      };

      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send(taskData);

      expect(response.status).toBe(201);
      expect(response.body.title).toBe(taskData.title);
      expect(response.body.userId).toBe('123');
    });

    it('should return 400 for missing title', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ description: 'No title' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Title is required');
    });
  });
});
```

## Frontend Test Examples

### Unit Test Example - TaskForm Component

```javascript
/**
 * @fileoverview TaskForm component unit tests
 * @module test/unit/components/TaskForm.test.jsx
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TaskForm from '../../../src/components/TaskForm';

describe('TaskForm', () => {
  const mockOnAddTask = jest.fn();

  beforeEach(() => {
    mockOnAddTask.mockClear();
  });

  it('should render form fields correctly', () => {
    render(<TaskForm onAddTask={mockOnAddTask} />);

    expect(screen.getByLabelText(/task title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create task/i })).toBeInTheDocument();
  });

  it('should call onAddTask with form data when submitted', async () => {
    const user = userEvent.setup();
    render(<TaskForm onAddTask={mockOnAddTask} />);

    const titleInput = screen.getByLabelText(/task title/i);
    const descriptionInput = screen.getByLabelText(/description/i);
    const submitButton = screen.getByRole('button', { name: /create task/i });

    await user.type(titleInput, 'New Task');
    await user.type(descriptionInput, 'Task Description');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnAddTask).toHaveBeenCalledWith({
        title: 'New Task',
        description: 'Task Description'
      });
    });
  });

  it('should disable submit button when title is empty', () => {
    render(<TaskForm onAddTask={mockOnAddTask} />);

    const submitButton = screen.getByRole('button', { name: /create task/i });
    expect(submitButton).toBeDisabled();
  });

  it('should clear form after successful submission', async () => {
    const user = userEvent.setup();
    mockOnAddTask.mockResolvedValue();
    
    render(<TaskForm onAddTask={mockOnAddTask} />);

    const titleInput = screen.getByLabelText(/task title/i);
    const descriptionInput = screen.getByLabelText(/description/i);
    const submitButton = screen.getByRole('button', { name: /create task/i });

    await user.type(titleInput, 'New Task');
    await user.type(descriptionInput, 'Task Description');
    await user.click(submitButton);

    await waitFor(() => {
      expect(titleInput).toHaveValue('');
      expect(descriptionInput).toHaveValue('');
    });
  });
});
```

### Integration Test Example - TodoPage

```javascript
/**
 * @fileoverview TodoPage integration tests
 * @module test/integration/pages/TodoPage.integration.test.jsx
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../../src/context/AuthContext';
import TodoPage from '../../../src/pages/TodoPage';
import * as tasksAPI from '../../../src/api/tasks';

// Mock API calls
jest.mock('../../../src/api/tasks');

describe('TodoPage Integration', () => {
  const mockTasks = [
    {
      _id: '1',
      title: 'Task 1',
      description: 'Description 1',
      completed: false,
      userId: '123'
    },
    {
      _id: '2',
      title: 'Task 2',
      description: 'Description 2',
      completed: true,
      userId: '123'
    }
  ];

  beforeEach(() => {
    tasksAPI.getTasks.mockResolvedValue(mockTasks);
    tasksAPI.createTask.mockResolvedValue({
      _id: '3',
      title: 'New Task',
      description: 'New Description',
      completed: false,
      userId: '123'
    });
  });

  const renderWithProviders = (component) => {
    return render(
      <BrowserRouter>
        <AuthProvider>
          {component}
        </AuthProvider>
      </BrowserRouter>
    );
  };

  it('should load and display tasks', async () => {
    renderWithProviders(<TodoPage />);

    await waitFor(() => {
      expect(screen.getByText('Task 1')).toBeInTheDocument();
      expect(screen.getByText('Task 2')).toBeInTheDocument();
    });
  });

  it('should create new task when form is submitted', async () => {
    const user = userEvent.setup();
    renderWithProviders(<TodoPage />);

    const titleInput = screen.getByLabelText(/task title/i);
    const descriptionInput = screen.getByLabelText(/description/i);
    const submitButton = screen.getByRole('button', { name: /create task/i });

    await user.type(titleInput, 'New Task');
    await user.type(descriptionInput, 'New Description');
    await user.click(submitButton);

    await waitFor(() => {
      expect(tasksAPI.createTask).toHaveBeenCalledWith({
        title: 'New Task',
        description: 'New Description'
      });
    });
  });
});
```

## E2E Test Example - Cypress

```javascript
/**
 * @fileoverview End-to-end test for complete user workflow
 * @module cypress/e2e/todo.cy.js
 */

describe('Task Management E2E', () => {
  beforeEach(() => {
    // Visit the application
    cy.visit('http://localhost:5173');
  });

  it('should complete full user workflow', () => {
    // Login
    cy.get('[data-testid=email-input]').type('test@example.com');
    cy.get('[data-testid=password-input]').type('password123');
    cy.get('[data-testid=login-button]').click();

    // Verify redirect to todo page
    cy.url().should('include', '/');
    cy.get('[data-testid=todo-page]').should('be.visible');

    // Create new task
    cy.get('[data-testid=task-title-input]').type('E2E Test Task');
    cy.get('[data-testid=task-description-input]').type('E2E Test Description');
    cy.get('[data-testid=create-task-button]').click();

    // Verify task is created
    cy.get('[data-testid=task-item]').should('contain', 'E2E Test Task');

    // Toggle task completion
    cy.get('[data-testid=task-checkbox]').first().click();
    cy.get('[data-testid=task-item]').first().should('have.class', 'completed');

    // Edit task
    cy.get('[data-testid=edit-task-button]').first().click();
    cy.get('[data-testid=edit-title-input]').clear().type('Updated Task');
    cy.get('[data-testid=save-task-button]').click();
    cy.get('[data-testid=task-item]').should('contain', 'Updated Task');

    // Delete task
    cy.get('[data-testid=delete-task-button]').first().click();
    cy.get('[data-testid=confirm-delete-button]').click();
    cy.get('[data-testid=task-item]').should('not.contain', 'Updated Task');

    // Logout
    cy.get('[data-testid=logout-button]').click();
    cy.url().should('include', '/login');
  });

  it('should handle authentication errors', () => {
    // Try to login with invalid credentials
    cy.get('[data-testid=email-input]').type('invalid@example.com');
    cy.get('[data-testid=password-input]').type('wrongpassword');
    cy.get('[data-testid=login-button]').click();

    // Verify error message
    cy.get('[data-testid=error-message]').should('contain', 'Invalid credentials');
  });
});
```

## Test Utilities and Helpers

### Backend Test Helpers

```javascript
/**
 * @fileoverview Test utilities for backend testing
 * @module test/utils/testHelpers.js
 */

const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

/**
 * Generates a test JWT token
 * @param {Object} payload - Token payload
 * @returns {string} JWT token
 */
const generateToken = (payload = {}) => {
  return jwt.sign(
    { id: '123', email: 'test@example.com', ...payload },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: '1h' }
  );
};

/**
 * Creates a test user in the database
 * @param {Object} userData - User data
 * @returns {Object} Created user
 */
const createTestUser = async (userData = {}) => {
  const User = require('../../src/models/User');
  return await User.create({
    email: 'test@example.com',
    password: 'password123',
    ...userData
  });
};

/**
 * Cleans up test database
 */
const cleanupDatabase = async () => {
  const collections = await mongoose.connection.db.collections();
  for (let collection of collections) {
    await collection.deleteMany({});
  }
};

module.exports = {
  generateToken,
  createTestUser,
  cleanupDatabase
};
```

### Frontend Test Helpers

```javascript
/**
 * @fileoverview Test utilities for frontend testing
 * @module test/utils/testHelpers.jsx
 */

import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../src/context/AuthContext';

/**
 * Custom render function with providers
 * @param {React.ReactElement} ui - Component to render
 * @param {Object} options - Render options
 * @returns {Object} Render result
 */
const renderWithProviders = (ui, options = {}) => {
  const AllTheProviders = ({ children }) => {
    return (
      <BrowserRouter>
        <AuthProvider>
          {children}
        </AuthProvider>
      </BrowserRouter>
    );
  };

  return render(ui, { wrapper: AllTheProviders, ...options });
};

/**
 * Mocks localStorage for testing
 * @param {Object} items - Items to mock
 */
const mockLocalStorage = (items = {}) => {
  const localStorageMock = {
    getItem: jest.fn((key) => items[key] || null),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn()
  };
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock
  });
  return localStorageMock;
};

export {
  renderWithProviders,
  mockLocalStorage
};
```

## Best Practices

### Test Organization
- Group related tests using `describe` blocks
- Use descriptive test names that explain the behavior
- Follow the AAA pattern (Arrange, Act, Assert)
- Keep tests independent and isolated

### Mocking Strategy
- Mock external dependencies (APIs, databases)
- Use realistic test data
- Avoid over-mocking internal functions
- Mock at the right level (unit vs integration)

### Assertions
- Test one thing per test case
- Use specific assertions over generic ones
- Test both happy path and error scenarios
- Verify side effects and state changes

### Performance
- Use test data factories for complex objects
- Implement proper cleanup in `afterEach`/`afterAll`
- Run tests in parallel when possible
- Monitor test execution time

---

*These examples demonstrate comprehensive testing approaches for both backend and frontend components, ensuring code quality and reliability.* 