# Context Integration Tests

This directory contains integration tests for React Context providers.

## Structure

Integration tests for contexts should test:
- Context provider rendering
- Context value updates
- Consumer component integration
- State management scenarios
- Error handling in context

## Example Test Structure

```jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { AuthProvider, useAuth } from '../../../src/context/AuthContext';

const TestComponent = () => {
  const { user, login, logout } = useAuth();
  return (
    <div>
      <span data-testid="user">{user ? user.email : 'Not logged in'}</span>
      <button onClick={() => login('token')}>Login</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

describe('AuthContext Integration Tests', () => {
  describe('Context Provider', () => {
    // Test context provider functionality
  });

  describe('Context Consumers', () => {
    // Test components using the context
  });

  describe('State Management', () => {
    // Test state updates and persistence
  });

  describe('Error Handling', () => {
    // Test error scenarios in context
  });
});
```

## Best Practices

1. **Test provider-consumer relationship** - Ensure context values are properly passed down
2. **Test state updates** - Verify context state changes correctly
3. **Test persistence** - If using localStorage/sessionStorage, test persistence
4. **Test error boundaries** - Ensure context errors are handled properly
5. **Test multiple consumers** - Verify multiple components can use the same context 