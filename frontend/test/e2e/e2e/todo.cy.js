// cypress/e2e/todo.cy.js
import LoginPage from '../support/pageObjects/LoginPage';
import TodoPage from '../support/pageObjects/TodoPage';

describe('Todo App - UI Automation', () => {
  beforeEach(() => {
    cy.fixture('users').as('users');
    cy.visit('/');
  });

  it('Login with valid credentials', function () {
    LoginPage.visit();
    LoginPage.fillEmail(this.users.validUser.email);
    LoginPage.fillPassword(this.users.validUser.password);
    LoginPage.submit();
    LoginPage.assertLoginSuccess();
  });

  it('Login with invalid credentials', function () {
    LoginPage.visit();
    LoginPage.fillEmail(this.users.invalidUser.email);
    LoginPage.fillPassword(this.users.invalidUser.password);
    LoginPage.submit();
    LoginPage.assertLoginFailure();
  });

  it('Create new todo item', function () {
    // Login first
    LoginPage.visit();
    LoginPage.fillEmail(this.users.validUser.email);
    LoginPage.fillPassword(this.users.validUser.password);
    LoginPage.submit();
    
    // Create todo
    TodoPage.createTodo('Learn Cypress', 'Study Cypress testing framework');
    TodoPage.assertTodoVisible('Learn Cypress');
  });

  it('Edit existing todo item', function () {
    // Login first
    LoginPage.visit();
    LoginPage.fillEmail(this.users.validUser.email);
    LoginPage.fillPassword(this.users.validUser.password);
    LoginPage.submit();
    
    // Create and edit todo
    TodoPage.createTodo('Old Task', 'Initial description');
    TodoPage.editTodo('Old Task', 'Updated Task');
    TodoPage.assertTodoVisible('Updated Task');
  });

  it('Delete todo item', function () {
    // Login first
    LoginPage.visit();
    LoginPage.fillEmail(this.users.validUser.email);
    LoginPage.fillPassword(this.users.validUser.password);
    LoginPage.submit();
    
    // Create and delete todo
    TodoPage.createTodo('Temporary Task', 'Will be deleted');
    TodoPage.deleteTodo('Temporary Task');
    TodoPage.assertTodoNotVisible('Temporary Task');
  });
}); 