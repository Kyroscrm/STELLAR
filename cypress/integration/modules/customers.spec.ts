/// <reference types="cypress" />
import { performance } from 'perf_hooks';

describe('Customers Module Tests', () => {
  beforeEach(() => {
    performance.clearMarks();
    performance.clearMeasures();
    cy.login('admin');
    cy.url().should('include', '/customers');
  });

  it('should load customers list without errors', () => {
    performance.mark('customers-start');

    cy.visit('/customers');
    cy.checkNoConsoleErrors();

    // Verify key elements
    cy.get('[data-testid="customers-table"]').should('exist');
    cy.get('[data-testid="new-customer-button"]').should('exist');
    cy.get('[data-testid="customer-search"]').should('exist');

    performance.mark('customers-end');
    performance.measure('customers-load', 'customers-start', 'customers-end');

    const measure = performance.getEntriesByName('customers-load')[0];
    cy.wrap(measure.duration).should('be.lessThan', 500);
  });

  it('should perform CRUD operations on customers', () => {
    const testCustomer = {
      name: 'Test Customer',
      email: 'customer@example.com',
      phone: '123-456-7890',
      address: '123 Test St',
      type: 'Business'
    };

    // Create
    cy.get('[data-testid="new-customer-button"]').click();
    cy.get('[data-testid="customer-name-input"]').type(testCustomer.name);
    cy.get('[data-testid="customer-email-input"]').type(testCustomer.email);
    cy.get('[data-testid="customer-phone-input"]').type(testCustomer.phone);
    cy.get('[data-testid="customer-address-input"]').type(testCustomer.address);
    cy.get('[data-testid="customer-type-select"]').select(testCustomer.type);
    cy.get('[data-testid="save-customer-button"]').click();

    // Verify toast
    cy.get('[data-testid="toast-success"]')
      .should('exist')
      .and('contain', 'Customer created successfully');

    // Read
    cy.reload();
    cy.get('[data-testid="customers-table"]')
      .should('contain', testCustomer.name)
      .and('contain', testCustomer.email);

    // Update
    cy.get(`[data-testid="edit-customer-${testCustomer.email}"]`).click();
    const updatedAddress = '456 Updated St';
    cy.get('[data-testid="customer-address-input"]')
      .clear()
      .type(updatedAddress);
    cy.get('[data-testid="save-customer-button"]').click();

    // Verify update
    cy.get('[data-testid="toast-success"]')
      .should('exist')
      .and('contain', 'Customer updated successfully');

    cy.get('[data-testid="customers-table"]')
      .should('contain', updatedAddress);

    // Delete
    cy.get(`[data-testid="delete-customer-${testCustomer.email}"]`).click();
    cy.get('[data-testid="confirm-delete-button"]').click();

    // Verify deletion
    cy.get('[data-testid="toast-success"]')
      .should('exist')
      .and('contain', 'Customer deleted successfully');

    cy.get('[data-testid="customers-table"]')
      .should('not.contain', testCustomer.email);
  });

  it('should handle search and filtering', () => {
    // Create test customers if they don't exist
    const customers = [
      { name: 'Alpha Corp', type: 'Business' },
      { name: 'Beta Services', type: 'Business' },
      { name: 'Charlie Smith', type: 'Individual' }
    ];

    // Search functionality
    cy.get('[data-testid="customer-search"]').type('Alpha');
    cy.get('[data-testid="customers-table"]')
      .should('contain', 'Alpha Corp')
      .and('not.contain', 'Beta Services');

    // Clear search
    cy.get('[data-testid="customer-search"]').clear();

    // Filter by type
    cy.get('[data-testid="customer-type-filter"]').select('Individual');
    cy.get('[data-testid="customers-table"]')
      .should('contain', 'Charlie Smith')
      .and('not.contain', 'Alpha Corp')
      .and('not.contain', 'Beta Services');
  });

  it('should handle optimistic updates correctly', () => {
    // Create a customer
    cy.get('[data-testid="new-customer-button"]').click();
    cy.get('[data-testid="customer-name-input"]').type('Optimistic Customer');
    cy.get('[data-testid="customer-email-input"]').type('optimistic@test.com');

    // Intercept the create request and delay it
    cy.intercept('POST', '/api/customers', (req) => {
      req.reply({
        delay: 2000,
        body: { ...req.body, id: 'test-id' }
      });
    }).as('createCustomer');

    // Submit and verify optimistic update
    cy.get('[data-testid="save-customer-button"]').click();

    // Should show immediately in the table
    cy.get('[data-testid="customers-table"]')
      .should('contain', 'Optimistic Customer');

    // Verify loading state
    cy.get('[data-testid="customer-row-optimistic@test.com"]')
      .should('have.class', 'opacity-50');

    // Wait for actual update
    cy.wait('@createCustomer');

    // Verify final state
    cy.get('[data-testid="customer-row-optimistic@test.com"]')
      .should('not.have.class', 'opacity-50');
  });

  it('should not contain placeholder data', () => {
    cy.visit('/customers');
    cy.checkNoPlaceholders();
  });

  it('should handle network failures with rollback', () => {
    // Intercept and fail the create request
    cy.intercept('POST', '/api/customers', {
      statusCode: 500,
      body: { error: 'Server error' }
    }).as('failedCreate');

    // Try to create a customer
    cy.get('[data-testid="new-customer-button"]').click();
    cy.get('[data-testid="customer-name-input"]').type('Failed Customer');
    cy.get('[data-testid="customer-email-input"]').type('failed@test.com');
    cy.get('[data-testid="save-customer-button"]').click();

    // Verify error handling
    cy.get('[data-testid="toast-error"]')
      .should('exist')
      .and('contain', 'Failed to create customer');

    // Verify rollback
    cy.get('[data-testid="customers-table"]')
      .should('not.contain', 'Failed Customer');
  });
});
