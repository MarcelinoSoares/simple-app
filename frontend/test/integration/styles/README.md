# Styles Integration Tests

This directory contains integration tests for CSS/styling integration.

## Structure

Integration tests for styles should test:
- CSS class application
- Responsive design
- Theme integration
- CSS-in-JS functionality
- Animation and transitions

## Example Test Structure

```jsx
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import Component from '../../../src/components/Component';

describe('Styles Integration Tests', () => {
  describe('CSS Classes', () => {
    // Test CSS class application
  });

  describe('Responsive Design', () => {
    // Test responsive behavior
  });

  describe('Theme Integration', () => {
    // Test theme-based styling
  });

  describe('Animations', () => {
    // Test CSS animations and transitions
  });
});

## Best Practices

1. **Test CSS classes** - Verify correct classes are applied based on props/state
2. **Test responsive behavior** - Use `window.resizeTo` to test breakpoints
3. **Test theme integration** - Verify theme values are properly applied
4. **Test accessibility** - Ensure proper contrast ratios and focus states
5. **Test animations** - Verify animations trigger correctly
6. **Use data-testid** - Add test IDs for style-specific testing 