class TodoPage {
  createTodo(title, description) {
    cy.get("input[name='title']").type(title);
    cy.get("textarea[name='description']").type(description);
    cy.contains("Add").click();
  }
  editTodo(oldTitle, newTitle) {
    cy.contains(oldTitle).parent().within(() => {
      cy.get("button.edit").click();
    });
    cy.get("input[name='title']").clear().type(newTitle);
    cy.contains("Save").click();
  }
  deleteTodo(title) {
    cy.contains(title).parent().within(() => {
      cy.get("button.delete").click();
    });
  }
  assertTodoVisible(title) {
    cy.contains(title).should("be.visible");
  }
  assertTodoNotVisible(title) {
    cy.contains(title).should("not.exist");
  }
}
export default new TodoPage(); 