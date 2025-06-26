import { performance } from 'perf_hooks';

describe('Leads Module', () => {
  beforeEach(() => {
    // Reset performance marks
    performance.clearMarks();
    performance.clearMeasures();

    // Login before each test
    cy.visit('/login');
    cy.get('[data-cy=email-input]').type('admin@example.com');
    cy.get('[data-cy=password-input]').type('admin123');
    cy.get('[data-cy=login-button]').click();

    // Navigate to leads page
    cy.visit('/leads');
  });

  it('should load leads page without errors', () => {
    // Mark start of page load
    performance.mark('leads-page-start');

    // Wait for leads table to be visible
    cy.get('[data-cy=leads-table]').should('be.visible');

    // Mark end and measure
    performance.mark('leads-page-end');
    performance.measure('leads-page-load', 'leads-page-start', 'leads-page-end');

    // Assert load time
    const measure = performance.getEntriesByName('leads-page-load')[0];
    expect(measure.duration).to.be.lessThan(500);

    // Check for no console errors
    cy.window().then((win) => {
      expect(win.console.error).to.have.callCount(0);
    });

    // Verify no placeholder content
    cy.contains('Lorem ipsum').should('not.exist');
  });

  it('should perform CRUD operations on leads', () => {
    // CREATE
    cy.get('[data-cy=new-lead-button]').click();
    cy.get('[data-cy=lead-name-input]').type('Test Lead');
    cy.get('[data-cy=lead-email-input]').type('test@example.com');
    cy.get('[data-cy=lead-phone-input]').type('1234567890');
    cy.get('[data-cy=save-lead-button]').click();

    // Verify toast and table update
    cy.get('[data-cy=toast]').should('contain', 'Lead created successfully');
    cy.get('[data-cy=leads-table]').should('contain', 'Test Lead');

    // READ - Refresh and verify persistence
    cy.reload();
    cy.get('[data-cy=leads-table]').should('contain', 'Test Lead');

    // UPDATE
    cy.get('[data-cy=edit-lead-button]').first().click();
    cy.get('[data-cy=lead-name-input]').clear().type('Updated Lead');
    cy.get('[data-cy=save-lead-button]').click();
    cy.get('[data-cy=toast]').should('contain', 'Lead updated successfully');
    cy.get('[data-cy=leads-table]').should('contain', 'Updated Lead');

    // DELETE
    cy.get('[data-cy=delete-lead-button]').first().click();
    cy.get('[data-cy=confirm-delete-button]').click();
    cy.get('[data-cy=toast]').should('contain', 'Lead deleted successfully');
    cy.get('[data-cy=leads-table]').should('not.contain', 'Updated Lead');
  });

  it('should handle network failure gracefully', () => {
    // Simulate network failure
    cy.intercept('POST', '/api/leads', {
      statusCode: 500,
      body: { error: 'Internal Server Error' }
    }).as('createLeadError');

    // Attempt to create lead
    cy.get('[data-cy=new-lead-button]').click();
    cy.get('[data-cy=lead-name-input]').type('Failed Lead');
    cy.get('[data-cy=save-lead-button]').click();

    // Verify error handling
    cy.wait('@createLeadError');
    cy.get('[data-cy=toast]').should('contain', 'Error creating lead');
    cy.get('[data-cy=leads-table]').should('not.contain', 'Failed Lead');
  });
});
