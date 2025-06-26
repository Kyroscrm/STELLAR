/// <reference types="cypress" />
import { performance } from 'perf_hooks';

describe('Invoices Module Tests', () => {
  beforeEach(() => {
    performance.clearMarks();
    performance.clearMeasures();
    cy.login('admin');
    cy.url().should('include', '/invoices');
  });

  it('should load invoices list without errors', () => {
    performance.mark('invoices-start');

    cy.visit('/invoices');
    cy.checkNoConsoleErrors();

    // Verify key elements
    cy.get('[data-testid="invoices-table"]').should('exist');
    cy.get('[data-testid="new-invoice-button"]').should('exist');
    cy.get('[data-testid="invoice-filters"]').should('exist');

    performance.mark('invoices-end');
    performance.measure('invoices-load', 'invoices-start', 'invoices-end');

    const measure = performance.getEntriesByName('invoices-load')[0];
    cy.wrap(measure.duration).should('be.lessThan', 500);
  });

  it('should create invoice with line items', () => {
    const testInvoice = {
      customer: 'Test Customer',
      items: [
        { description: 'Service 1', quantity: 1, price: 200 },
        { description: 'Service 2', quantity: 3, price: 75 }
      ],
      dueDate: '2024-12-31',
      notes: 'Test invoice notes'
    };

    // Create
    cy.get('[data-testid="new-invoice-button"]').click();
    cy.get('[data-testid="customer-select"]').type(testInvoice.customer);
    cy.get('[data-testid="customer-select-option"]').first().click();
    cy.get('[data-testid="invoice-due-date"]').type(testInvoice.dueDate);

    // Add line items
    testInvoice.items.forEach((item, index) => {
      if (index > 0) {
        cy.get('[data-testid="add-line-item"]').click();
      }
      cy.get(`[data-testid="line-item-${index}-description"]`).type(item.description);
      cy.get(`[data-testid="line-item-${index}-quantity"]`).type(item.quantity.toString());
      cy.get(`[data-testid="line-item-${index}-price"]`).type(item.price.toString());
    });

    cy.get('[data-testid="invoice-notes"]').type(testInvoice.notes);
    cy.get('[data-testid="save-invoice-button"]').click();

    // Verify toast
    cy.get('[data-testid="toast-success"]')
      .should('exist')
      .and('contain', 'Invoice created successfully');

    // Verify total calculation
    const expectedTotal = testInvoice.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    cy.get('[data-testid="invoice-total"]')
      .should('contain', expectedTotal.toString());
  });

  it('should handle payment recording', () => {
    // Find an unpaid invoice
    cy.get('[data-testid="invoice-status-filter"]').select('Unpaid');
    cy.get('[data-testid="invoices-table"] tbody tr').first().as('firstInvoice');

    // Record payment
    cy.get('@firstInvoice')
      .find('[data-testid="record-payment"]')
      .click();

    // Fill payment details
    cy.get('[data-testid="payment-amount"]').type('100');
    cy.get('[data-testid="payment-method"]').select('Credit Card');
    cy.get('[data-testid="payment-reference"]').type('REF123');
    cy.get('[data-testid="confirm-payment"]').click();

    // Verify success
    cy.get('[data-testid="toast-success"]')
      .should('exist')
      .and('contain', 'Payment recorded successfully');

    // Verify payment reflected
    cy.get('@firstInvoice')
      .find('[data-testid="paid-amount"]')
      .should('contain', '100');
  });

  it('should handle invoice status transitions', () => {
    // Create test invoice
    cy.get('[data-testid="new-invoice-button"]').click();
    cy.get('[data-testid="customer-select"]').type('Status Test Customer');
    cy.get('[data-testid="customer-select-option"]').first().click();
    cy.get('[data-testid="save-invoice-button"]').click();

    // Verify initial draft status
    cy.get('[data-testid="invoice-status"]')
      .should('contain', 'Draft');

    // Send invoice
    cy.get('[data-testid="send-invoice"]').click();
    cy.get('[data-testid="confirm-send"]').click();

    // Verify sent status
    cy.get('[data-testid="invoice-status"]')
      .should('contain', 'Sent');

    // Mark as paid
    cy.get('[data-testid="record-payment"]').click();
    cy.get('[data-testid="payment-amount"]').type('100');
    cy.get('[data-testid="confirm-payment"]').click();

    // Verify paid status
    cy.get('[data-testid="invoice-status"]')
      .should('contain', 'Paid');
  });

  it('should handle optimistic updates correctly', () => {
    cy.get('[data-testid="new-invoice-button"]').click();

    // Fill basic info
    cy.get('[data-testid="customer-select"]').type('Optimistic Customer');
    cy.get('[data-testid="customer-select-option"]').first().click();

    // Intercept the create request and delay it
    cy.intercept('POST', '/api/invoices', (req) => {
      req.reply({
        delay: 2000,
        body: { ...req.body, id: 'test-id' }
      });
    }).as('createInvoice');

    // Submit and verify optimistic update
    cy.get('[data-testid="save-invoice-button"]').click();

    // Should show immediately in the table
    cy.get('[data-testid="invoices-table"]')
      .should('contain', 'Optimistic Customer');

    // Verify loading state
    cy.get('[data-testid="invoice-row-test-id"]')
      .should('have.class', 'opacity-50');

    // Wait for actual update
    cy.wait('@createInvoice');

    // Verify final state
    cy.get('[data-testid="invoice-row-test-id"]')
      .should('not.have.class', 'opacity-50');
  });

  it('should not contain placeholder data', () => {
    cy.visit('/invoices');
    cy.checkNoPlaceholders();
  });

  it('should handle network failures with rollback', () => {
    // Intercept and fail the create request
    cy.intercept('POST', '/api/invoices', {
      statusCode: 500,
      body: { error: 'Server error' }
    }).as('failedCreate');

    // Try to create an invoice
    cy.get('[data-testid="new-invoice-button"]').click();
    cy.get('[data-testid="customer-select"]').type('Failed Customer');
    cy.get('[data-testid="customer-select-option"]').first().click();
    cy.get('[data-testid="save-invoice-button"]').click();

    // Verify error handling
    cy.get('[data-testid="toast-error"]')
      .should('exist')
      .and('contain', 'Failed to create invoice');

    // Verify rollback
    cy.get('[data-testid="invoices-table"]')
      .should('not.contain', 'Failed Customer');
  });
});
