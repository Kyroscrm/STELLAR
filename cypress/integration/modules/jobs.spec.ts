/// <reference types="cypress" />
import { performance } from 'perf_hooks';

describe('Jobs Module Tests', () => {
  beforeEach(() => {
    performance.clearMarks();
    performance.clearMeasures();
    cy.login('manager');
    cy.url().should('include', '/jobs');
  });

  it('should load jobs board without errors', () => {
    performance.mark('jobs-start');

    cy.visit('/jobs');
    cy.checkNoConsoleErrors();

    // Verify key elements
    cy.get('[data-testid="jobs-board"]').should('exist');
    cy.get('[data-testid="new-job-button"]').should('exist');
    cy.get('[data-testid="job-filters"]').should('exist');

    performance.mark('jobs-end');
    performance.measure('jobs-load', 'jobs-start', 'jobs-end');

    const measure = performance.getEntriesByName('jobs-load')[0];
    cy.wrap(measure.duration).should('be.lessThan', 500);
  });

  it('should create job from estimate', () => {
    const testJob = {
      title: 'Test Job',
      customer: 'Test Customer',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      budget: '5000',
      status: 'Scheduled'
    };

    // Create
    cy.get('[data-testid="new-job-button"]').click();
    cy.get('[data-testid="job-title-input"]').type(testJob.title);
    cy.get('[data-testid="customer-select"]').type(testJob.customer);
    cy.get('[data-testid="customer-select-option"]').first().click();
    cy.get('[data-testid="job-start-date"]').type(testJob.startDate);
    cy.get('[data-testid="job-end-date"]').type(testJob.endDate);
    cy.get('[data-testid="job-budget-input"]').type(testJob.budget);
    cy.get('[data-testid="job-status-select"]').select(testJob.status);
    cy.get('[data-testid="save-job-button"]').click();

    // Verify toast
    cy.get('[data-testid="toast-success"]')
      .should('exist')
      .and('contain', 'Job created successfully');

    // Verify job appears in correct column
    cy.get('[data-testid="column-scheduled"]')
      .should('contain', testJob.title);

    // Move to In Progress
    cy.get(`[data-testid="job-card-${testJob.title}"]`)
      .drag('[data-testid="column-in-progress"]');

    // Verify status update
    cy.get('[data-testid="toast-success"]')
      .should('exist')
      .and('contain', 'Job status updated');

    cy.get('[data-testid="column-in-progress"]')
      .should('contain', testJob.title);

    // Edit job
    cy.get(`[data-testid="edit-job-${testJob.title}"]`).click();
    const updatedBudget = '6000';
    cy.get('[data-testid="job-budget-input"]')
      .clear()
      .type(updatedBudget);
    cy.get('[data-testid="save-job-button"]').click();

    // Verify update
    cy.get(`[data-testid="job-card-${testJob.title}"]`)
      .should('contain', updatedBudget);

    // Delete job
    cy.get(`[data-testid="delete-job-${testJob.title}"]`).click();
    cy.get('[data-testid="confirm-delete-button"]').click();

    // Verify deletion
    cy.get('[data-testid="toast-success"]')
      .should('exist')
      .and('contain', 'Job deleted successfully');

    cy.get('[data-testid="jobs-board"]')
      .should('not.contain', testJob.title);
  });

  it('should handle job filtering and search', () => {
    // Create test jobs if they don't exist
    const jobs = [
      { title: 'Urgent Repair', priority: 'High' },
      { title: 'Regular Maintenance', priority: 'Medium' },
      { title: 'Future Installation', priority: 'Low' }
    ];

    // Filter by priority
    cy.get('[data-testid="priority-filter"]').select('High');
    cy.get('[data-testid="jobs-board"]')
      .should('contain', 'Urgent Repair')
      .and('not.contain', 'Regular Maintenance')
      .and('not.contain', 'Future Installation');

    // Search functionality
    cy.get('[data-testid="job-search"]').type('Installation');
    cy.get('[data-testid="jobs-board"]')
      .should('contain', 'Future Installation')
      .and('not.contain', 'Urgent Repair')
      .and('not.contain', 'Regular Maintenance');
  });

  it('should handle optimistic updates correctly', () => {
    // Create a job
    cy.get('[data-testid="new-job-button"]').click();
    cy.get('[data-testid="job-title-input"]').type('Optimistic Job');

    // Intercept the create request and delay it
    cy.intercept('POST', '/api/jobs', (req) => {
      req.reply({
        delay: 2000,
        body: { ...req.body, id: 'test-id' }
      });
    }).as('createJob');

    // Submit and verify optimistic update
    cy.get('[data-testid="save-job-button"]').click();

    // Should show immediately in the board
    cy.get('[data-testid="jobs-board"]')
      .should('contain', 'Optimistic Job');

    // Verify loading state
    cy.get('[data-testid="job-card-test-id"]')
      .should('have.class', 'opacity-50');

    // Wait for actual update
    cy.wait('@createJob');

    // Verify final state
    cy.get('[data-testid="job-card-test-id"]')
      .should('not.have.class', 'opacity-50');
  });

  it('should not contain placeholder data', () => {
    cy.visit('/jobs');
    cy.checkNoPlaceholders();
  });

  it('should handle network failures with rollback', () => {
    // Intercept and fail the create request
    cy.intercept('POST', '/api/jobs', {
      statusCode: 500,
      body: { error: 'Server error' }
    }).as('failedCreate');

    // Try to create a job
    cy.get('[data-testid="new-job-button"]').click();
    cy.get('[data-testid="job-title-input"]').type('Failed Job');
    cy.get('[data-testid="save-job-button"]').click();

    // Verify error handling
    cy.get('[data-testid="toast-error"]')
      .should('exist')
      .and('contain', 'Failed to create job');

    // Verify rollback
    cy.get('[data-testid="jobs-board"]')
      .should('not.contain', 'Failed Job');
  });

  it('should handle job scheduling conflicts', () => {
    // Create overlapping jobs
    const jobs = [
      {
        title: 'Job 1',
        startDate: '2024-01-01',
        endDate: '2024-01-15'
      },
      {
        title: 'Job 2',
        startDate: '2024-01-10', // Overlaps with Job 1
        endDate: '2024-01-20'
      }
    ];

    // Create first job
    cy.get('[data-testid="new-job-button"]').click();
    cy.get('[data-testid="job-title-input"]').type(jobs[0].title);
    cy.get('[data-testid="job-start-date"]').type(jobs[0].startDate);
    cy.get('[data-testid="job-end-date"]').type(jobs[0].endDate);
    cy.get('[data-testid="save-job-button"]').click();

    // Try to create second job
    cy.get('[data-testid="new-job-button"]').click();
    cy.get('[data-testid="job-title-input"]').type(jobs[1].title);
    cy.get('[data-testid="job-start-date"]').type(jobs[1].startDate);
    cy.get('[data-testid="job-end-date"]').type(jobs[1].endDate);

    // Verify conflict warning
    cy.get('[data-testid="scheduling-conflict-warning"]')
      .should('exist')
      .and('contain', 'Schedule conflict detected');
  });
});
