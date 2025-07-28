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

// Custom command to visit with clean state
Cypress.Commands.add('visitWithCleanState', (url, options) => {
  cy.clearLocalStorage()
  return cy.visit(url, options)
})

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

// Custom command to wait for tasks to load
Cypress.Commands.add('waitForTasksToLoad', () => {
  cy.contains('Loading tasks...').should('not.exist')
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