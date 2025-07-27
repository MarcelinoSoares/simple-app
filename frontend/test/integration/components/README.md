# Component Integration Tests

This directory contains integration tests for React components.

## Structure

Integration tests for components should test:
- Component rendering with different props
- User interactions (clicks, form submissions, etc.)
- Integration with context providers
- API calls and data flow
- Error handling scenarios

## Example Test Structure

```jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import ComponentName from '../../../src/components/ComponentName';

describe('ComponentName Integration Tests', () => {
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

## Best Practices

1. **Mock external dependencies** - Mock API calls, context providers, and external libraries
2. **Test user interactions** - Use `fireEvent` and `waitFor` to simulate user behavior
3. **Test error scenarios** - Ensure components handle errors gracefully
4. **Test loading states** - Verify loading indicators work correctly
5. **Test accessibility** - Use `getByRole`, `getByLabelText` for accessible queries 