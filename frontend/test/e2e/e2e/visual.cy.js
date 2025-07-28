import LoginPage from '../support/pageObjects/LoginPage'
import TodoPage from '../support/pageObjects/TodoPage'

describe('Visual Regression Tests', () => {
  beforeEach(() => {
    cy.fixture('users').as('users')
    cy.clearLocalStorage()
    cy.mockApiResponses()
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
    // Mock successful login
    cy.mockAuth();
    
    // Visit todo page directly
    cy.visit('/');
    
    // Wait for tasks to load
    cy.waitForTasksToLoad()
    
    // Create a task
    cy.createTaskAndWait('Test Task for Snapshot', 'This is a test task for visual regression testing')
    
    // Take snapshot
    cy.takeSnapshot('dashboard-with-tasks')
  })

  it('should match completed task snapshot', function () {
    // Mock successful login
    cy.mockAuth();
    
    // Visit todo page directly
    cy.visit('/');
    
    // Wait for tasks to load
    cy.waitForTasksToLoad()
    
    // Create and complete a task
    cy.createTaskAndWait('Task to Complete', 'This task will be marked as completed')
    
    // Mark as completed by clicking the checkbox
    cy.contains('Task to Complete').closest('div').parent().within(() => {
      cy.get('button').first().click() // First button is the checkbox
    })
    
    // Take snapshot
    cy.takeSnapshot('dashboard-completed-task')
  })
}) 