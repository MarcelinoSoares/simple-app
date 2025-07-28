// Simple UI tests that don't require backend
describe('Simple UI Tests', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should show login page by default', () => {
    cy.url().should('include', '/login');
    cy.contains('Sign In').should('be.visible');
    cy.get('#email').should('be.visible');
    cy.get('#password').should('be.visible');
    cy.get('button[type="submit"]').should('be.visible');
  });

  it('should have proper form elements', () => {
    cy.get('#email').should('have.attr', 'type', 'email');
    cy.get('#password').should('have.attr', 'type', 'password');
    cy.get('button[type="submit"]').should('contain.text', 'Sign In');
  });

  it('should show validation for empty form', () => {
    cy.get('button[type="submit"]').click();
    // Should stay on login page
    cy.url().should('include', '/login');
  });

  it('should show validation for invalid email', () => {
    cy.get('#email').type('invalid-email');
    cy.get('#password').type('password');
    cy.get('button[type="submit"]').click();
    // Should stay on login page
    cy.url().should('include', '/login');
  });

  it('should navigate to todo page after successful login', () => {
    // Mock successful login
    cy.window().then((win) => {
      win.localStorage.setItem('token', 'mock-token');
      win.localStorage.setItem('user', JSON.stringify({
        id: '1',
        email: 'test@example.com',
        name: 'Test User'
      }));
    });
    
    cy.visit('/');
    cy.url().should('not.include', '/login');
    cy.contains('Task Manager').should('be.visible');
  });

  it('should show task form when logged in', () => {
    // Mock successful login
    cy.window().then((win) => {
      win.localStorage.setItem('token', 'mock-token');
      win.localStorage.setItem('user', JSON.stringify({
        id: '1',
        email: 'test@example.com',
        name: 'Test User'
      }));
    });
    
    cy.visit('/');
    cy.get('[data-testid="task-form"]').should('be.visible');
    cy.get('#task-title').should('be.visible');
    cy.get('#task-description').should('be.visible');
    cy.get('[data-testid="create-task-btn"]').should('be.visible');
  });

  it('should show empty state when no tasks', () => {
    // Mock successful login
    cy.window().then((win) => {
      win.localStorage.setItem('token', 'mock-token');
      win.localStorage.setItem('user', JSON.stringify({
        id: '1',
        email: 'test@example.com',
        name: 'Test User'
      }));
    });
    
    cy.visit('/');
    cy.contains('No tasks yet').should('be.visible');
    cy.contains('Create your first task above').should('be.visible');
  });

  it('should have logout button', () => {
    // Mock successful login
    cy.window().then((win) => {
      win.localStorage.setItem('token', 'mock-token');
      win.localStorage.setItem('user', JSON.stringify({
        id: '1',
        email: 'test@example.com',
        name: 'Test User'
      }));
    });
    
    cy.visit('/');
    cy.contains('Logout').should('be.visible');
  });
}); 