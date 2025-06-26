import 'cypress-axe';

describe('Modal Accessibility Tests', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.injectAxe();
  });

  it('Create Lead modal should be accessible', () => {
    cy.get('[data-test="create-lead-button"]').click();
    cy.get('[role="dialog"]').should('exist');
    cy.checkA11y();
  });

  it('Edit Lead modal should be accessible', () => {
    cy.visit('/leads');
    cy.get('[data-test="edit-lead-button"]').first().click();
    cy.get('[role="dialog"]').should('exist');
    cy.checkA11y();
  });

  it('Confirm Dialog should be accessible', () => {
    cy.visit('/leads');
    cy.get('[data-test="delete-lead-button"]').first().click();
    cy.get('[role="alertdialog"]').should('exist');
    cy.checkA11y();
  });

  it('Modal should trap focus', () => {
    cy.get('[data-test="create-lead-button"]').click();

    // Focus should start on first focusable element
    cy.focused().should('have.attr', 'name', 'name');

    // Tab through all focusable elements
    cy.tab().should('have.attr', 'name', 'email');
    cy.tab().should('have.attr', 'name', 'phone');
    cy.tab().should('have.attr', 'type', 'submit');

    // Tab should cycle back to first element
    cy.tab().should('have.attr', 'name', 'name');

    // Shift+Tab should cycle backwards
    cy.tab({ shift: true }).should('have.attr', 'type', 'submit');
  });

  it('Modal should close on Escape key', () => {
    cy.get('[data-test="create-lead-button"]').click();
    cy.get('[role="dialog"]').should('exist');
    cy.get('body').type('{esc}');
    cy.get('[role="dialog"]').should('not.exist');
  });

  it('Modal should return focus to trigger on close', () => {
    const triggerButton = cy.get('[data-test="create-lead-button"]');
    triggerButton.click();
    cy.get('[role="dialog"]').should('exist');
    cy.get('button[aria-label="Close modal"]').click();
    cy.get('[role="dialog"]').should('not.exist');
    triggerButton.should('be.focused');
  });
});
