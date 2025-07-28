// ***********************************************************
// This example support/e2e.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Global configuration
Cypress.on('uncaught:exception', (err, runnable) => {
  // returning false here prevents Cypress from
  // failing the test on uncaught exceptions
  return false
})

// Custom command to handle login
Cypress.Commands.add('login', (email, password) => {
  cy.visit('/login')
  cy.get('input[type="email"]').type(email)
  cy.get('input[type="password"]').type(password)
  cy.get('button[type="submit"]').click()
})

// Custom command to create a todo
Cypress.Commands.add('createTodo', (title) => {
  cy.get('input[placeholder="Nova tarefa"]').type(title)
  cy.get('button:contains("Criar")').click()
})

// Custom command to delete a todo
Cypress.Commands.add('deleteTodo', (title) => {
  cy.contains('span', title)
    .parent()
    .find('button:contains("Excluir")')
    .click()
})

// Custom command for visual snapshots (simplified)
Cypress.Commands.add('takeSnapshot', (name) => {
  cy.screenshot(name)
}) 