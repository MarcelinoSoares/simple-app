class LoginPage {
  visit() {
    cy.visitWithCleanState("/login");
  }
  fillEmail(email) {
    cy.get("#email").clear().type(email);
  }
  fillPassword(password) {
    cy.get("#password").clear().type(password);
  }
  submit() {
    cy.get("button[type='submit']").click();
  }
  assertLoginSuccess() {
    // After successful login, user should be redirected to the main page
    cy.url().should("not.include", "/login");
    cy.url().should("include", "/");
    cy.contains("Task Manager").should("be.visible");
  }
  assertLoginFailure() {
    cy.contains("Login failed").should("be.visible");
  }
}
export default new LoginPage(); 