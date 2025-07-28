import LoginPage from '../support/pageObjects/LoginPage'
import TodoPage from '../support/pageObjects/TodoPage'

describe('Visual Regression Tests', () => {
  beforeEach(() => {
    cy.fixture('users').as('users')
    cy.clearLocalStorage()
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
    
    // Wait for page to load and tasks to load
    TodoPage.waitForTasksToLoad()
    cy.takeSnapshot('dashboard-empty')
  })

  it('should match dashboard with tasks snapshot', function () {
    // Login first
    LoginPage.visit()
    LoginPage.fillEmail(this.users.validUser.email)
    LoginPage.fillPassword(this.users.validUser.password)
    LoginPage.submit()
    
    // Wait for tasks to load
    TodoPage.waitForTasksToLoad()
    
    // Create a task
    TodoPage.createTodo('Test Task for Snapshot', 'This is a test task for visual regression testing')
    cy.wait(1000) // Wait for task to be created
    
    // Take snapshot
    cy.takeSnapshot('dashboard-with-tasks')
  })

  it('should match completed task snapshot', function () {
    // Login first
    LoginPage.visit()
    LoginPage.fillEmail(this.users.validUser.email)
    LoginPage.fillPassword(this.users.validUser.password)
    LoginPage.submit()
    
    // Wait for tasks to load
    TodoPage.waitForTasksToLoad()
    
    // Create and complete a task
    TodoPage.createTodo('Task to Complete', 'This task will be marked as completed')
    cy.wait(1000) // Wait for task to be created
    
    // Mark as completed by clicking the checkbox
    cy.contains('Task to Complete').closest('div').within(() => {
      cy.get('button').first().click() // First button is the checkbox
    })
    
    // Take snapshot
    cy.takeSnapshot('dashboard-completed-task')
  })
}) 