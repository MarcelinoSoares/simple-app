# Routes Integration Tests

This directory contains integration tests for React Router routes and navigation.

## Structure

Integration tests for routes should test:
- Route rendering
- Navigation between routes
- Route protection (authentication)
- URL parameters
- Query parameters
- Redirects

## Example Test Structure

```jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { vi } from 'vitest';
import App from '../../../src/App';

describe('Routes Integration Tests', () => {
  describe('Public Routes', () => {
    // Test routes accessible without authentication
  });

  describe('Protected Routes', () => {
    // Test routes that require authentication
  });

  describe('Navigation', () => {
    // Test navigation between routes
  });

  describe('Route Parameters', () => {
    // Test dynamic routes with parameters
  });

  describe('Redirects', () => {
    // Test automatic redirects
  });
});

## Best Practices

1. **Use BrowserRouter** - Wrap components in BrowserRouter for route testing
2. **Test route protection** - Verify protected routes redirect unauthenticated users
3. **Test navigation** - Use `useNavigate` mock to test programmatic navigation
4. **Test URL parameters** - Verify dynamic routes work with parameters
5. **Test query parameters** - Test routes that use search parameters
6. **Test 404 handling** - Ensure invalid routes are handled properly 