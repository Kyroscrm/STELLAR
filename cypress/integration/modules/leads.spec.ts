/// <reference types="cypress" />

describe('Leads Module', () => {
  beforeEach(() => {
    // Visit the home page first to initialize the app
    cy.visit('/');

    // Use our improved login command
    cy.loginByLocalStorage('admin');

    // Now navigate to the leads page
    cy.visit('/admin/leads');
  });

  // Basic test to verify page loads
  it('should load leads page', () => {
    // We should be on the leads page
    cy.url().should('include', '/admin/leads');
  });

  // Test for UI elements
  it('should display UI elements', () => {
    // Check for page title
    cy.contains('h1', 'Leads').should('be.visible');

    // Check for basic UI elements - using more generic selectors
    cy.get('button').contains('New Lead').should('be.visible');
    cy.get('input[placeholder*="Search"]').should('be.visible');
    cy.get('select').should('be.visible');
  });
});
