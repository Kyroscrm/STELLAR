/// <reference types="cypress" />
/// <reference types="cypress-axe" />

// @ts-nocheck - Cypress types are handled by reference directives

import './commands';
import 'cypress-axe';

// Extend Cypress commands
declare global {
  namespace Cypress {
    interface Chainable {
      tab(): Chainable<Element>;
      checkA11y(context?: string | null, options?: Record<string, unknown>): void;
      assertFocus(selector: string): void;
      checkAriaLabel(selector: string, expectedLabel: string): void;
      checkAriaRole(selector: string, expectedRole: string): void;
      checkElementsText(expectedText: string): void;
    }
  }
}

// Add custom command for keyboard tab navigation
Cypress.Commands.add('tab', { prevSubject: 'optional' }, (subject) => {
  if (subject) {
    cy.wrap(subject).trigger('keydown', { keyCode: 9 });
  } else {
    cy.focused().trigger('keydown', { keyCode: 9 });
  }
  return cy.focused();
});

// Configure aXe
Cypress.Commands.add('configureAxe', () => {
  return cy.window().then((win) => {
    if (win.axe) {
      return new Cypress.Promise((resolve) => {
        win.axe.configure({
          rules: [
            {
              id: 'color-contrast',
              enabled: true,
            },
            {
              id: 'landmark-one-main',
              enabled: true,
            },
            {
              id: 'page-has-heading-one',
              enabled: true,
            },
            {
              id: 'region',
              enabled: true,
            },
          ],
        });
        resolve(null);
      });
    }
    return null;
  });
});

// Add custom command for accessibility checks
Cypress.Commands.add('checkA11y', (context = null, options = {}) => {
  cy.injectAxe();
  cy.configureAxe();
  cy.checkA11y(context, {
    runOnly: {
      type: 'tag',
      values: ['wcag2a', 'wcag2aa']
    },
    ...options
  });
});

// Add custom command for checking focus
Cypress.Commands.add('assertFocus', (selector: string) => {
  cy.get(selector).should('be.focused');
});

// Add custom command for checking ARIA attributes
Cypress.Commands.add('checkAriaLabel', (selector: string, expectedLabel: string) => {
  cy.get(selector).should('have.attr', 'aria-label', expectedLabel);
});

// Add custom command for checking ARIA roles
Cypress.Commands.add('checkAriaRole', (selector: string, expectedRole: string) => {
  cy.get(selector).should('have.attr', 'role', expectedRole);
});

// Add custom command for checking text content of elements
Cypress.Commands.add('checkElementsText', { prevSubject: true }, (subject, expectedText) => {
  cy.wrap(subject).each(($el) => {
    cy.wrap($el).invoke('text').then((text) => {
      expect(text.trim()).to.equal(expectedText);
    });
  });
});

beforeEach(() => {
  cy.visit('/');
  cy.injectAxe();
  cy.configureAxe();
});
