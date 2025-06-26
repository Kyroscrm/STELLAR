/// <reference types="cypress" />
/// <reference types="cypress-axe" />

declare namespace Cypress {
  interface Chainable {
    injectAxe(): void;
    checkA11y(
      context?: string | Node | null,
      options?: any
    ): void;
    tab(): Chainable<Element>;
  }
}

describe('Accessibility checks', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.injectAxe();
  });

  const pages = [
    { path: '/leads', name: 'Leads' },
    { path: '/customers', name: 'Customers' },
    { path: '/estimates', name: 'Estimates' },
    { path: '/invoices', name: 'Invoices' },
    { path: '/tasks', name: 'Tasks' },
    { path: '/admin/dashboard', name: 'Admin Dashboard' }
  ];

  pages.forEach(({ path, name }) => {
    it(`Has no detectable a11y violations on ${name} page load`, () => {
      cy.visit(path);
      cy.injectAxe();
      cy.checkA11y(null, {
        runOnly: {
          type: 'tag',
          values: ['wcag2a', 'wcag2aa']
        }
      });
    });

    it(`Has no a11y violations on ${name} page after interaction`, () => {
      cy.visit(path);
      cy.injectAxe();

      // Common interactive elements
      cy.get('button').first().click({ force: true });
      cy.get('input').first().type('test');

      cy.checkA11y(null, {
        runOnly: {
          type: 'tag',
          values: ['wcag2a', 'wcag2aa']
        }
      });
    });
  });

  // Test modals
  const modals = [
    { trigger: '[data-testid="create-lead-button"]', name: 'Create Lead' },
    { trigger: '[data-testid="create-customer-button"]', name: 'Create Customer' },
    { trigger: '[data-testid="create-estimate-button"]', name: 'Create Estimate' },
    { trigger: '[data-testid="create-invoice-button"]', name: 'Create Invoice' },
    { trigger: '[data-testid="create-task-button"]', name: 'Create Task' }
  ];

  modals.forEach(({ trigger, name }) => {
    it(`Has no a11y violations in ${name} modal`, () => {
      cy.visit('/');
      cy.injectAxe();
      cy.get(trigger).click();
      cy.checkA11y('[role="dialog"]', {
        runOnly: {
          type: 'tag',
          values: ['wcag2a', 'wcag2aa']
        }
      });
    });
  });

  // Test keyboard navigation
  it('Supports keyboard navigation', () => {
    cy.visit('/');
    cy.injectAxe();

    // Tab through all interactive elements
    cy.get('body').tab().should('have.focus');
    cy.focused().should('be.visible');

    // Keep tabbing and checking focus visibility
    for (let i = 0; i < 10; i++) {
      cy.focused().tab();
      cy.focused().should('be.visible');
    }
  });
});
