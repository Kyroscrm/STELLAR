/// <reference types="cypress" />

describe('Admin Dashboard', () => {
  it('should redirect to login page when not authenticated', () => {
    cy.visit('/admin');
    // Check if we're redirected to login
    cy.url().should('include', '/login');
  });
});
