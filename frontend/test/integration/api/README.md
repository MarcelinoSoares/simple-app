# API Integration Tests

This directory contains integration tests for API service modules.

## Structure

Integration tests for API modules should test:
- API endpoint calls
- Request/response handling
- Error handling
- Authentication integration
- Data transformation

## Example Test Structure

```jsx
import { vi } from 'vitest';
import { login, getTasks, createTask } from '../../../src/api';

// Mock fetch globally
global.fetch = vi.fn();

describe('API Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Authentication API', () => {
    // Test login, logout, token management
  });

  describe('Tasks API', () => {
    // Test CRUD operations for tasks
  });

  describe('Error Handling', () => {
    // Test network errors, server errors, etc.
  });

  describe('Request/Response', () => {
    // Test request formatting and response parsing
  });
});

## Best Practices

1. **Mock fetch/axios** - Mock HTTP client to control responses
2. **Test request format** - Verify correct headers, body, and URL
3. **Test response handling** - Ensure data is properly parsed
4. **Test error scenarios** - Network errors, server errors, validation errors
5. **Test authentication** - Verify tokens are included in requests
6. **Test data transformation** - Ensure API data is properly formatted 