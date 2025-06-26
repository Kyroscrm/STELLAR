/// <reference types="cypress" />
import { performance } from 'perf_hooks';

describe('Tasks Module Tests', () => {
  beforeEach(() => {
    performance.clearMarks();
    performance.clearMeasures();
    cy.login('manager');
    cy.url().should('include', '/tasks');
  });

  it('should load tasks board without errors', () => {
    performance.mark('tasks-start');

    cy.visit('/tasks');
    cy.checkNoConsoleErrors();

    // Verify key elements
    cy.get('[data-testid="tasks-board"]').should('exist');
    cy.get('[data-testid="new-task-button"]').should('exist');
    cy.get('[data-testid="task-filters"]').should('exist');

    performance.mark('tasks-end');
    performance.measure('tasks-load', 'tasks-start', 'tasks-end');

    const measure = performance.getEntriesByName('tasks-load')[0];
    cy.wrap(measure.duration).should('be.lessThan', 500);
  });

  it('should create and manage tasks', () => {
    const testTask = {
      title: 'Test Task',
      description: 'This is a test task',
      assignee: 'John Doe',
      dueDate: '2024-12-31',
      priority: 'High'
    };

    // Create
    cy.get('[data-testid="new-task-button"]').click();
    cy.get('[data-testid="task-title-input"]').type(testTask.title);
    cy.get('[data-testid="task-description-input"]').type(testTask.description);
    cy.get('[data-testid="task-assignee-select"]').type(testTask.assignee);
    cy.get('[data-testid="assignee-option"]').first().click();
    cy.get('[data-testid="task-due-date"]').type(testTask.dueDate);
    cy.get('[data-testid="task-priority-select"]').select(testTask.priority);
    cy.get('[data-testid="save-task-button"]').click();

    // Verify toast
    cy.get('[data-testid="toast-success"]')
      .should('exist')
      .and('contain', 'Task created successfully');

    // Verify task appears in Todo column
    cy.get('[data-testid="column-todo"]')
      .should('contain', testTask.title);

    // Move to In Progress
    cy.get(`[data-testid="task-card-${testTask.title}"]`)
      .drag('[data-testid="column-in-progress"]');

    // Verify status update
    cy.get('[data-testid="toast-success"]')
      .should('exist')
      .and('contain', 'Task status updated');

    cy.get('[data-testid="column-in-progress"]')
      .should('contain', testTask.title);

    // Edit task
    cy.get(`[data-testid="edit-task-${testTask.title}"]`).click();
    const updatedDescription = 'Updated description';
    cy.get('[data-testid="task-description-input"]')
      .clear()
      .type(updatedDescription);
    cy.get('[data-testid="save-task-button"]').click();

    // Verify update
    cy.get(`[data-testid="task-card-${testTask.title}"]`)
      .should('contain', updatedDescription);

    // Delete task
    cy.get(`[data-testid="delete-task-${testTask.title}"]`).click();
    cy.get('[data-testid="confirm-delete-button"]').click();

    // Verify deletion
    cy.get('[data-testid="toast-success"]')
      .should('exist')
      .and('contain', 'Task deleted successfully');

    cy.get('[data-testid="tasks-board"]')
      .should('not.contain', testTask.title);
  });

  it('should handle task filtering and search', () => {
    // Create test tasks if they don't exist
    const tasks = [
      { title: 'High Priority Task', priority: 'High' },
      { title: 'Medium Task', priority: 'Medium' },
      { title: 'Low Priority Bug', priority: 'Low' }
    ];

    // Filter by priority
    cy.get('[data-testid="priority-filter"]').select('High');
    cy.get('[data-testid="tasks-board"]')
      .should('contain', 'High Priority Task')
      .and('not.contain', 'Medium Task')
      .and('not.contain', 'Low Priority Bug');

    // Search functionality
    cy.get('[data-testid="task-search"]').type('Bug');
    cy.get('[data-testid="tasks-board"]')
      .should('contain', 'Low Priority Bug')
      .and('not.contain', 'High Priority Task')
      .and('not.contain', 'Medium Task');
  });

  it('should handle optimistic updates correctly', () => {
    // Create a task
    cy.get('[data-testid="new-task-button"]').click();
    cy.get('[data-testid="task-title-input"]').type('Optimistic Task');

    // Intercept the create request and delay it
    cy.intercept('POST', '/api/tasks', (req) => {
      req.reply({
        delay: 2000,
        body: { ...req.body, id: 'test-id' }
      });
    }).as('createTask');

    // Submit and verify optimistic update
    cy.get('[data-testid="save-task-button"]').click();

    // Should show immediately in the board
    cy.get('[data-testid="tasks-board"]')
      .should('contain', 'Optimistic Task');

    // Verify loading state
    cy.get('[data-testid="task-card-test-id"]')
      .should('have.class', 'opacity-50');

    // Wait for actual update
    cy.wait('@createTask');

    // Verify final state
    cy.get('[data-testid="task-card-test-id"]')
      .should('not.have.class', 'opacity-50');
  });

  it('should not contain placeholder data', () => {
    cy.visit('/tasks');
    cy.checkNoPlaceholders();
  });

  it('should handle network failures with rollback', () => {
    // Intercept and fail the create request
    cy.intercept('POST', '/api/tasks', {
      statusCode: 500,
      body: { error: 'Server error' }
    }).as('failedCreate');

    // Try to create a task
    cy.get('[data-testid="new-task-button"]').click();
    cy.get('[data-testid="task-title-input"]').type('Failed Task');
    cy.get('[data-testid="save-task-button"]').click();

    // Verify error handling
    cy.get('[data-testid="toast-error"]')
      .should('exist')
      .and('contain', 'Failed to create task');

    // Verify rollback
    cy.get('[data-testid="tasks-board"]')
      .should('not.contain', 'Failed Task');
  });

  it('should handle task dependencies correctly', () => {
    // Create parent task
    cy.get('[data-testid="new-task-button"]').click();
    cy.get('[data-testid="task-title-input"]').type('Parent Task');
    cy.get('[data-testid="save-task-button"]').click();

    // Create child task
    cy.get('[data-testid="new-task-button"]').click();
    cy.get('[data-testid="task-title-input"]').type('Child Task');
    cy.get('[data-testid="task-parent-select"]').type('Parent Task');
    cy.get('[data-testid="parent-task-option"]').first().click();
    cy.get('[data-testid="save-task-button"]').click();

    // Verify dependency visualization
    cy.get('[data-testid="task-dependency-indicator"]')
      .should('exist');

    // Verify cannot complete parent before child
    cy.get('[data-testid="task-status-select-Parent-Task"]')
      .should('be.disabled');
  });
});
