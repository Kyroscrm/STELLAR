/// <reference types="cypress" />

describe('App', () => {
  it('should load the home page', () => {
    cy.visit('/');
    cy.get('body').should('be.visible');
  });
});
