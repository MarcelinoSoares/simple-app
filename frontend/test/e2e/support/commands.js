// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Override clearLocalStorage command
Cypress.Commands.overwrite('clearLocalStorage', () => {
  cy.window().then((win) => {
    win.localStorage.clear()
  })
})

// Custom command to set localStorage
Cypress.Commands.add('setLocalStorage', (key, value) => {
  cy.window().then((win) => {
    win.localStorage.setItem(key, value)
  })
})

// Custom command to get localStorage
Cypress.Commands.add('getLocalStorage', (key) => {
  cy.window().then((win) => {
    return win.localStorage.getItem(key)
  })
})

// Custom command to wait for API response
Cypress.Commands.add('waitForApi', (method, url, alias) => {
  cy.intercept(method, url).as(alias)
  cy.wait(`@${alias}`)
})

// Custom command to check if element exists
Cypress.Commands.add('elementExists', (selector) => {
  return cy.get('body').then(($body) => {
    return $body.find(selector).length > 0
  })
})

// Custom command to wait for page load
Cypress.Commands.add('waitForPageLoad', () => {
  cy.get('body').should('be.visible')
  cy.get('body').should('not.have.class', 'loading')
})

// Mock API responses for E2E tests
Cypress.Commands.add('mockApiResponses', () => {
  // Mock tasks API
  cy.intercept('GET', '**/api/tasks', {
    statusCode: 200,
    body: []
  }).as('getTasks');

    // Mock create task API
  cy.intercept('POST', '**/api/tasks', (req) => {
    const taskId = `task-${Date.now()}`;
    const newTask = {
      _id: taskId,
      title: req.body.title,
      description: req.body.description || '',
      completed: req.body.completed || false,
      userId: '1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    req.reply({
      statusCode: 201,
      body: newTask
    });
  }).as('createTask');

  // Mock update task API
  cy.intercept('PUT', '**/api/tasks/*', (req) => {
    const taskId = req.url.split('/').pop();
    const updatedTask = {
      _id: taskId,
      title: req.body.title || 'Updated Task',
      description: req.body.description || '',
      completed: req.body.completed || false,
      userId: '1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    req.reply({
      statusCode: 200,
      body: updatedTask
    });
  }).as('updateTask');

  // Mock delete task API
  cy.intercept('DELETE', '**/api/tasks/*', {
    statusCode: 204
  }).as('deleteTask');

  // Mock login API
  cy.intercept('POST', '**/api/auth/login', {
    statusCode: 200,
    body: {
      token: 'mock-jwt-token',
      user: {
        id: '1',
        email: 'test@example.com',
        name: 'Test User'
      }
    }
  }).as('login');

  // Mock register API
  cy.intercept('POST', '**/api/auth/register', {
    statusCode: 201,
    body: {
      token: 'mock-jwt-token',
      user: {
        id: '1',
        email: 'test@example.com',
        name: 'Test User'
      }
    }
  }).as('register');
});

// Mock successful authentication
Cypress.Commands.add('mockAuth', () => {
  cy.window().then((win) => {
    win.localStorage.setItem('token', 'mock-jwt-token');
    win.localStorage.setItem('user', JSON.stringify({
      id: '1',
      email: 'test@example.com',
      name: 'Test User'
    }));
  });
});

// Visit with clean state
Cypress.Commands.add('visitWithCleanState', (url) => {
  cy.clearLocalStorage();
  cy.visit(url);
});

// Wait for tasks to be loaded
Cypress.Commands.add('waitForTasksToLoad', () => {
  cy.contains('Loading tasks...').should('not.exist');
  cy.wait('@getTasks');
  cy.wait(1000); // Additional wait for UI to update
});

// Create a task and wait for it to be created
Cypress.Commands.add('createTaskAndWait', (title, description = '') => {
  cy.get('[data-testid="task-form"]').should('be.visible');
  cy.get('#task-title').should('be.visible').type(title);
  if (description) {
    cy.get('#task-description').type(description);
  }
  cy.get('[data-testid="create-task-btn"]').click();
  cy.wait('@createTask');
  cy.wait(1000); // Wait for UI to update
});

// Edit a task and wait for it to be updated
Cypress.Commands.add('editTaskAndWait', (oldTitle, newTitle) => {
  cy.contains(oldTitle).closest('div').parent().within(() => {
    cy.get('button[title="Edit task"]').click(); // Edit button
  });
  
  // Wait for edit mode to be active and find the input field
  cy.get('input[type="text"]').first().should('be.visible').clear().type(newTitle);
  cy.contains('Save').click();
  cy.wait('@updateTask');
  
  // Wait for the task to be updated in the UI
  cy.contains(oldTitle).should('not.exist');
  cy.contains(newTitle).should('be.visible');
  cy.wait(1000); // Additional wait for UI to update
});

// Delete a task and wait for it to be deleted
Cypress.Commands.add('deleteTaskAndWait', (title) => {
  cy.contains(title).closest('div').parent().within(() => {
    cy.get('button[title="Delete task"]').click(); // Delete button
  });
  
  cy.on('window:confirm', () => true);
  cy.wait('@deleteTask');
  cy.wait(1000); // Wait for UI to update
});

// Custom command to login
Cypress.Commands.add('login', (email = 'test@example.com', password = '123456') => {
  cy.clearLocalStorage()
  cy.visit('/login')
  cy.get('#email').type(email)
  cy.get('#password').type(password)
  cy.get('button[type="submit"]').click()
  cy.contains('Task Manager').should('be.visible')
})

// Custom command to create a task
Cypress.Commands.add('createTask', (title, description = '') => {
  cy.get('#task-title').type(title)
  if (description) {
    cy.get('#task-description').type(description)
  }
  cy.get('[data-testid="create-task-btn"]').click()
  cy.contains(title).should('be.visible')
})

// Custom command to delete a task
Cypress.Commands.add('deleteTask', (title) => {
  cy.contains(title).closest('div').within(() => {
    cy.get('svg').last().click() // Last SVG is the delete button
  })
  cy.on('window:confirm', () => true)
  cy.contains(title).should('not.exist')
})

// Custom command to toggle task completion
Cypress.Commands.add('toggleTask', (title) => {
  cy.contains(title).closest('div').within(() => {
    cy.get('button').first().click() // First button is the checkbox
  })
})

// Custom command to check if task is completed
Cypress.Commands.add('isTaskCompleted', (title) => {
  cy.contains(title).should('have.class', 'line-through')
})

// Custom command to check if task is not completed
Cypress.Commands.add('isTaskNotCompleted', (title) => {
  cy.contains(title).should('not.have.class', 'line-through')
})

// Custom command to edit a task
Cypress.Commands.add('editTask', (oldTitle, newTitle) => {
  // Click edit button
  cy.contains(oldTitle).closest('div').within(() => {
    cy.get('svg').first().click() // First SVG is the edit button
  })
  
  // Edit the title
  cy.get('input[type="text"]').first().clear().type(newTitle)
  
  // Save
  cy.contains('Save').click()
  
  // Verify the change
  cy.contains(newTitle).should('be.visible')
}) 