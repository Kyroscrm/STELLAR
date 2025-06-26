import 'cypress-axe';

describe('Form Accessibility Tests', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.injectAxe();
  });

  it('Lead form should be accessible', () => {
    cy.get('[data-test="create-lead-button"]').click();
    cy.checkA11y();
  });

  it('Estimate form should be accessible', () => {
    cy.visit('/estimates');
    cy.get('[data-test="create-estimate-button"]').click();
    cy.checkA11y();
  });

  it('Invoice form should be accessible', () => {
    cy.visit('/invoices');
    cy.get('[data-test="create-invoice-button"]').click();
    cy.checkA11y();
  });

  it('Form validation errors should be announced', () => {
    cy.visit('/leads');
    cy.get('[data-test="create-lead-button"]').click();
    cy.get('button[type="submit"]').click();
    cy.get('[role="alert"]').should('exist');
    cy.checkA11y();
  });

  it('Form fields should be navigable by keyboard', () => {
    cy.visit('/leads');
    cy.get('[data-test="create-lead-button"]').click();
    cy.focused().should('have.attr', 'name', 'name');
    cy.tab().should('have.attr', 'name', 'email');
    cy.tab().should('have.attr', 'name', 'phone');
  });
});
