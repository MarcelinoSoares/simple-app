import LoginPage from '../support/pageObjects/LoginPage'
import TodoPage from '../support/pageObjects/TodoPage'

describe('Visual Regression Tests', () => {
  beforeEach(() => {
    cy.fixture('users').as('users')
  })

  it('should match login page snapshot', () => {
    LoginPage.visit()
    cy.takeSnapshot('login-page')
  })

  it('should match dashboard snapshot after login', function () {
    // Login first
    LoginPage.visit()
    LoginPage.fillEmail(this.users.validUser.email)
    LoginPage.fillPassword(this.users.validUser.password)
    LoginPage.submit()
    
    // Wait for page to load
    cy.url().should('include', '/')
    cy.takeSnapshot('dashboard-empty')
  })

  it('should match dashboard with tasks snapshot', function () {
    // Login first
    LoginPage.visit()
    LoginPage.fillEmail(this.users.validUser.email)
    LoginPage.fillPassword(this.users.validUser.password)
    LoginPage.submit()
    
    // Create a task
    TodoPage.createTodo('Test Task for Snapshot', 'This is a test task for visual regression testing')
    
    // Take snapshot
    cy.takeSnapshot('dashboard-with-tasks')
  })

  it('should match completed task snapshot', function () {
    // Login first
    LoginPage.visit()
    LoginPage.fillEmail(this.users.validUser.email)
    LoginPage.fillPassword(this.users.validUser.password)
    LoginPage.submit()
    
    // Create and complete a task
    TodoPage.createTodo('Task to Complete', 'This task will be marked as completed')
    
    // Mark as completed (click on the task title)
    cy.contains('Task to Complete').click()
    
    // Take snapshot
    cy.takeSnapshot('dashboard-completed-task')
  })
}) 