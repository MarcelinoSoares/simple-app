class TodoPage {
  createTodo(title, description) {
    // Wait for the form to be visible
    cy.get('[data-testid="task-form"]').should('be.visible');
    cy.get("#task-title").should('be.visible').type(title);
    if (description) {
      cy.get("#task-description").type(description);
    }
    cy.get("[data-testid='create-task-btn']").click();
    // Wait for the task to be created
    cy.wait(1000);
  }
  
  editTodo(oldTitle, newTitle) {
    // Find the task by title and click the edit button
    cy.contains(oldTitle).closest('div').within(() => {
      cy.get('svg').first().click(); // First SVG is the edit button
    });
    
    // Clear and type new title in the edit input
    cy.get('input[type="text"]').first().clear().type(newTitle);
    
    // Click save button
    cy.contains("Save").click();
    // Wait for the edit to be saved
    cy.wait(1000);
  }
  
  deleteTodo(title) {
    // Find the task by title and click the delete button
    cy.contains(title).closest('div').within(() => {
      cy.get('svg').last().click(); // Last SVG is the delete button
    });
    
    // Confirm deletion in the confirmation dialog
    cy.on('window:confirm', () => true);
    // Wait for the deletion to be processed
    cy.wait(1000);
  }
  
  assertTodoVisible(title) {
    cy.contains(title).should("be.visible");
  }
  
  assertTodoNotVisible(title) {
    cy.contains(title).should("not.exist");
  }
  
  // Additional helper methods
  waitForTasksToLoad() {
    // Wait for loading to disappear and tasks to be loaded
    cy.contains("Loading tasks...").should("not.exist");
    // Additional wait to ensure tasks are fully loaded
    cy.wait(2000);
  }
  
  assertTaskCompleted(title) {
    cy.contains(title).should("have.class", "line-through");
  }
}
export default new TodoPage(); 