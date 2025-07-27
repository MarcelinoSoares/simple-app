class LoginPage {
  visit() {
    cy.visit("/login");
  }
  fillEmail(email) {
    cy.get("input[name='email']").clear().type(email);
  }
  fillPassword(password) {
    cy.get("input[name='password']").clear().type(password);
  }
  submit() {
    cy.get("button[type='submit']").click();
  }
  assertLoginSuccess() {
    cy.url().should("include", "/dashboard");
  }
  assertLoginFailure() {
    cy.contains("Invalid credentials").should("be.visible");
  }
}
export default new LoginPage(); 