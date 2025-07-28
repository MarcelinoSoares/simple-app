// cypress/e2e/todo.cy.js
import LoginPage from '../support/pageObjects/LoginPage';
import TodoPage from '../support/pageObjects/TodoPage';

describe('Todo App - UI Automation', () => {
  beforeEach(() => {
    cy.fixture('users').as('users');
    cy.clearLocalStorage();
    cy.mockApiResponses();
  });

  it('Login with valid credentials', function () {
    // Mock successful login
    cy.window().then((win) => {
      win.localStorage.setItem('token', 'mock-token');
      win.localStorage.setItem('user', JSON.stringify({
        id: '1',
        email: this.users.validUser.email,
        name: 'Test User'
      }));
    });
    
    // Visit login page - should redirect to todo page
    cy.visit('/login');
    cy.url().should('not.include', '/login');
    cy.url().should('include', '/');
    cy.contains('Task Manager').should('be.visible');
  });

  it('Login with invalid credentials', function () {
    // Mock failed login
    cy.intercept('POST', '**/api/auth/login', {
      statusCode: 401,
      body: {
        message: 'Invalid credentials'
      }
    }).as('loginFailed');
    
    LoginPage.visit();
    LoginPage.fillEmail(this.users.invalidUser.email);
    LoginPage.fillPassword(this.users.invalidUser.password);
    LoginPage.submit();
    
    cy.wait('@loginFailed');
    cy.contains('Invalid credentials').should('be.visible');
  });

  it('Create new todo item', function () {
    // Mock successful login
    cy.mockAuth();
    
    // Visit todo page directly
    cy.visit('/');
    
    // Wait for tasks to load
    cy.waitForTasksToLoad();
    
    // Create todo
    cy.createTaskAndWait('Learn Cypress', 'Study Cypress testing framework');
    cy.contains('Learn Cypress').should('be.visible');
  });

  it('Edit existing todo item', function () {
    // Mock successful login
    cy.mockAuth();
    
    // Mock update task API specifically for this test
    cy.intercept('PUT', '**/api/tasks/*', (req) => {
      const updatedTask = {
        _id: req.url.split('/').pop(),
        title: 'Updated Task',
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
    }).as('updateTaskForEdit');
    
    // Visit todo page directly
    cy.visit('/');
    
    // Wait for tasks to load
    cy.waitForTasksToLoad();
    
    // Create a task first
    cy.createTaskAndWait('Old Task', 'Initial description');
    
    // Check if task exists
    cy.contains('Old Task').should('be.visible');
    
    // Edit the task
    cy.contains('Old Task').closest('div').parent().within(() => {
      cy.get('button[title="Edit task"]').click();
    });
    
    // Check if we're in edit mode
    cy.get('input[type="text"]').first().should('be.visible');
    
    // Update the title
    cy.get('input[type="text"]').first().clear().type('Updated Task');
    cy.contains('Save').click();
    
    // Wait for the update
    cy.wait('@updateTaskForEdit');
    
    // Verify the task was updated
    cy.contains('Updated Task').should('be.visible');
  });

  it('Delete todo item', function () {
    // Mock successful login
    cy.mockAuth();
    
    // Visit todo page directly
    cy.visit('/');
    
    // Wait for tasks to load
    cy.waitForTasksToLoad();
    
    // Create and delete todo
    cy.createTaskAndWait('Temporary Task', 'Will be deleted');
    cy.deleteTaskAndWait('Temporary Task');
    cy.contains('Temporary Task').should('not.exist');
  });
}); 