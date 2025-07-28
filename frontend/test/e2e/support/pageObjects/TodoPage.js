class TodoPage {
  createTodo(title, description) {
    cy.get("#task-title").type(title);
    if (description) {
      cy.get("#task-description").type(description);
    }
    cy.get("[data-testid='create-task-btn']").click();
  }
  
  editTodo(oldTitle, newTitle) {
    // Find the task by title and click the edit button (pencil icon)
    cy.contains(oldTitle).closest('div').within(() => {
      cy.get('svg').first().click(); // First SVG is the edit button
    });
    
    // Clear and type new title in the edit input
    cy.get('input[type="text"]').first().clear().type(newTitle);
    
    // Click save button
    cy.contains("Save").click();
  }
  
  deleteTodo(title) {
    // Find the task by title and click the delete button (trash icon)
    cy.contains(title).closest('div').within(() => {
      cy.get('svg').last().click(); // Last SVG is the delete button
    });
    
    // Confirm deletion in the confirmation dialog
    cy.on('window:confirm', () => true);
  }
  
  assertTodoVisible(title) {
    cy.contains(title).should("be.visible");
  }
  
  assertTodoNotVisible(title) {
    cy.contains(title).should("not.exist");
  }
  
  // Additional helper methods
  waitForTasksToLoad() {
    cy.contains("Loading tasks...").should("not.exist");
  }
  
  assertTaskCompleted(title) {
    cy.contains(title).should("have.class", "line-through");
  }
}
export default new TodoPage(); 