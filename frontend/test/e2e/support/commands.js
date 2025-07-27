// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Custom command to clear localStorage
Cypress.Commands.add('clearLocalStorage', () => {
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

// Override visit command to handle authentication
Cypress.Commands.overwrite('visit', (originalFn, url, options) => {
  // Clear localStorage before each visit to ensure clean state
  cy.clearLocalStorage()
  return originalFn(url, options)
})

// Custom command to login
Cypress.Commands.add('login', (email = 'test@example.com', password = '123456') => {
  cy.clearLocalStorage()
  cy.visit('/login')
  cy.get('input[type="email"]').type(email)
  cy.get('input[type="password"]').type(password)
  cy.get('button[type="submit"]').click()
  cy.url().should('eq', Cypress.config().baseUrl + '/')
})

// Custom command to create a task
Cypress.Commands.add('createTask', (title) => {
  cy.get('input[placeholder="Nova tarefa"]').type(title)
  cy.get('button').contains('Criar').click()
  cy.get('ul li').should('contain', title)
})

// Custom command to delete a task
Cypress.Commands.add('deleteTask', (title) => {
  cy.get('ul li').contains(title).parent().find('button').contains('Excluir').click()
  cy.get('ul li').should('not.contain', title)
})

// Custom command to toggle task completion
Cypress.Commands.add('toggleTask', (title) => {
  cy.get('ul li').contains(title).click()
})

// Custom command to check if task is completed
Cypress.Commands.add('isTaskCompleted', (title) => {
  cy.get('ul li').contains(title).should('have.css', 'text-decoration', 'line-through solid rgb(0, 0, 0)')
})

// Custom command to check if task is not completed
Cypress.Commands.add('isTaskNotCompleted', (title) => {
  cy.get('ul li').contains(title).should('not.have.css', 'text-decoration', 'line-through solid rgb(0, 0, 0)')
}) 