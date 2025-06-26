/// <reference types="cypress" />

describe('Authentication', () => {
  it('should redirect to login when not authenticated', () => {
    cy.visit('/admin');
    cy.url().should('include', '/login');
  });

  it('should access admin dashboard when authenticated', () => {
    // First visit the site to initialize
    cy.visit('/');

    // Use our localStorage login command
    cy.loginByLocalStorage('admin');

    // Now try to access the admin page
    cy.visit('/admin');

    // We should stay on the admin page and not be redirected
    cy.url().should('include', '/admin');
    cy.url().should('not.include', '/login');
  });
});
