/// <reference types="cypress" />
import { performance } from 'perf_hooks';

describe('Estimates Module Tests', () => {
  beforeEach(() => {
    performance.clearMarks();
    performance.clearMeasures();
    cy.login('sales');
    cy.url().should('include', '/estimates');
  });

  it('should load estimates list without errors', () => {
    performance.mark('estimates-start');

    cy.visit('/estimates');
    cy.checkNoConsoleErrors();

    // Verify key elements
    cy.get('[data-testid="estimates-table"]').should('exist');
    cy.get('[data-testid="new-estimate-button"]').should('exist');
    cy.get('[data-testid="estimate-filters"]').should('exist');

    performance.mark('estimates-end');
    performance.measure('estimates-load', 'estimates-start', 'estimates-end');

    const measure = performance.getEntriesByName('estimates-load')[0];
    cy.wrap(measure.duration).should('be.lessThan', 500);
  });

  it('should create estimate from customer', () => {
    const testEstimate = {
      customer: 'Test Customer',
      items: [
        { description: 'Item 1', quantity: 1, price: 100 },
        { description: 'Item 2', quantity: 2, price: 50 }
      ],
      notes: 'Test estimate notes'
    };

    // Create
    cy.get('[data-testid="new-estimate-button"]').click();
    cy.get('[data-testid="customer-select"]').type(testEstimate.customer);
    cy.get('[data-testid="customer-select-option"]').first().click();

    // Add line items
    testEstimate.items.forEach((item, index) => {
      if (index > 0) {
        cy.get('[data-testid="add-line-item"]').click();
      }
      cy.get(`[data-testid="line-item-${index}-description"]`).type(item.description);
      cy.get(`[data-testid="line-item-${index}-quantity"]`).type(item.quantity.toString());
      cy.get(`[data-testid="line-item-${index}-price"]`).type(item.price.toString());
    });

    cy.get('[data-testid="estimate-notes"]').type(testEstimate.notes);
    cy.get('[data-testid="save-estimate-button"]').click();

    // Verify toast
    cy.get('[data-testid="toast-success"]')
      .should('exist')
      .and('contain', 'Estimate created successfully');

    // Verify total calculation
    const expectedTotal = testEstimate.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    cy.get('[data-testid="estimate-total"]')
      .should('contain', expectedTotal.toString());
  });

  it('should convert estimate to invoice', () => {
    // Find an approved estimate
    cy.get('[data-testid="estimate-status-filter"]').select('Approved');
    cy.get('[data-testid="estimates-table"] tbody tr').first().as('firstEstimate');

    // Convert to invoice
    cy.get('@firstEstimate')
      .find('[data-testid="convert-to-invoice"]')
      .click();

    // Verify conversion modal
    cy.get('[data-testid="conversion-modal"]').should('exist');
    cy.get('[data-testid="confirm-conversion"]').click();

    // Verify success and navigation
    cy.get('[data-testid="toast-success"]')
      .should('exist')
      .and('contain', 'Estimate converted to invoice');

    cy.url().should('include', '/invoices');
  });

  it('should handle line item calculations correctly', () => {
    cy.get('[data-testid="new-estimate-button"]').click();

    // Add items and verify subtotal updates
    const items = [
      { quantity: 2, price: 100 }, // Subtotal: 200
      { quantity: 1, price: 150 }, // Subtotal: 150
    ];

    items.forEach((item, index) => {
      if (index > 0) {
        cy.get('[data-testid="add-line-item"]').click();
      }
      cy.get(`[data-testid="line-item-${index}-quantity"]`).type(item.quantity.toString());
      cy.get(`[data-testid="line-item-${index}-price"]`).type(item.price.toString());

      // Verify line item subtotal
      cy.get(`[data-testid="line-item-${index}-subtotal"]`)
        .should('contain', (item.quantity * item.price).toString());
    });

    // Verify total
    const total = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    cy.get('[data-testid="estimate-total"]')
      .should('contain', total.toString());
  });

  it('should handle optimistic updates correctly', () => {
    cy.get('[data-testid="new-estimate-button"]').click();

    // Fill basic info
    cy.get('[data-testid="customer-select"]').type('Optimistic Customer');
    cy.get('[data-testid="customer-select-option"]').first().click();

    // Intercept the create request and delay it
    cy.intercept('POST', '/api/estimates', (req) => {
      req.reply({
        delay: 2000,
        body: { ...req.body, id: 'test-id' }
      });
    }).as('createEstimate');

    // Submit and verify optimistic update
    cy.get('[data-testid="save-estimate-button"]').click();

    // Should show immediately in the table
    cy.get('[data-testid="estimates-table"]')
      .should('contain', 'Optimistic Customer');

    // Verify loading state
    cy.get('[data-testid="estimate-row-test-id"]')
      .should('have.class', 'opacity-50');

    // Wait for actual update
    cy.wait('@createEstimate');

    // Verify final state
    cy.get('[data-testid="estimate-row-test-id"]')
      .should('not.have.class', 'opacity-50');
  });

  it('should not contain placeholder data', () => {
    cy.visit('/estimates');
    cy.checkNoPlaceholders();
  });

  it('should handle network failures with rollback', () => {
    // Intercept and fail the create request
    cy.intercept('POST', '/api/estimates', {
      statusCode: 500,
      body: { error: 'Server error' }
    }).as('failedCreate');

    // Try to create an estimate
    cy.get('[data-testid="new-estimate-button"]').click();
    cy.get('[data-testid="customer-select"]').type('Failed Customer');
    cy.get('[data-testid="customer-select-option"]').first().click();
    cy.get('[data-testid="save-estimate-button"]').click();

    // Verify error handling
    cy.get('[data-testid="toast-error"]')
      .should('exist')
      .and('contain', 'Failed to create estimate');

    // Verify rollback
    cy.get('[data-testid="estimates-table"]')
      .should('not.contain', 'Failed Customer');
  });
});
