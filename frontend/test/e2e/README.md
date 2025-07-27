# Cypress E2E Tests

This directory contains the end-to-end (E2E) tests for the application using Cypress.

## Structure

```
cypress/
├── e2e/
│   ├── login.cy.js      # Authentication tests
│   └── tasks.cy.js      # Task management tests
├── support/
│   ├── commands.js      # Custom commands
│   └── e2e.js          # Global configuration
└── README.md           # This documentation
```

## Prerequisites

1. **Backend running:** Make sure the backend is running at `http://localhost:3001`
2. **Frontend running:** Make sure the frontend is running at `http://localhost:5173`

## Available commands

### Run tests
```bash
# Run all tests in headless mode
npm run test:e2e

# Open Cypress Test Runner (graphical interface)
npm run test:e2e:open

# Direct Cypress commands
npm run cypress:run
npm run cypress:open
```

### Custom commands

The following custom commands are available in tests:

- `cy.login(email, password)` - Logs into the application
- `cy.createTask(title)` - Creates a new task
- `cy.deleteTask(title)` - Deletes a task
- `cy.toggleTask(title)` - Toggles task completion status
- `cy.isTaskCompleted(title)` - Checks if a task is completed
- `cy.isTaskNotCompleted(title)` - Checks if a task is not completed

## Test scenarios

### Login (`login.cy.js`)
- ✅ Displays login form
- ✅ Successful login with valid credentials
- ✅ Displays error for invalid credentials
- ✅ Validates required fields
- ✅ Redirects to login when accessing protected route without token

### Tasks (`tasks.cy.js`)
- ✅ Displays task page elements
- ✅ Creates new task
- ✅ Toggles task completion status
- ✅ Deletes task
- ✅ Handles empty task creation
- ✅ Clears input after creating task
- ✅ Manages multiple tasks
- ✅ Persists tasks after page reload

## Configuration

The `cypress.config.js` file contains the main configurations:

- **Base URL:** `http://localhost:5173` (default Vite port)
- **Viewport:** 1280x720
- **Timeouts:** 10 seconds for commands and requests
- **Videos:** Disabled for better performance
- **Screenshots:** Enabled on failure

## Development tips

1. **Test data:** Use unique timestamps to avoid conflicts
2. **Cleanup:** localStorage is cleared before each test
3. **Isolation:** Each test is independent
4. **Debug:** Use `cy.pause()` to pause execution during development

## Troubleshooting

### Common issues

1. **Backend not running:**
   - Check if server is at `http://localhost:3001`
   - Confirm if API routes are working

2. **Frontend not running:**
   - Run `npm run dev` in the frontend directory
   - Check if it's running on port 5173

3. **Tests failing:**
   - Check if database is clean
   - Confirm if test credentials are correct
   - Check console logs for errors

### Logs and debug

To see detailed logs during execution:
```bash
npm run cypress:run -- --headed
```

For interactive debugging:
```bash
npm run cypress:open
``` 