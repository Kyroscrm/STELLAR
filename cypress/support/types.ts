/// <reference types="cypress" />
/// <reference types="cypress-axe" />

declare namespace Cypress {
  interface Chainable<Subject = any> {
    /**
     * Custom command to check text content of elements
     * @example cy.checkElementsText('Expected Text')
     */
    checkElementsText(expectedText: string): Chainable<Subject>;

    /**
     * Custom command for keyboard tab navigation
     * @example cy.tab()
     */
    tab(): Chainable<Subject>;

    /**
     * Custom command for configuring axe
     * @example cy.configureAxe()
     */
    configureAxe(): Chainable<Subject>;

    /**
     * Custom command for checking focus
     * @example cy.assertFocus('#element')
     */
    assertFocus(selector: string): Chainable<Subject>;

    /**
     * Custom command for checking ARIA attributes
     * @example cy.checkAriaLabel('#element', 'Label')
     */
    checkAriaLabel(selector: string, expectedLabel: string): Chainable<Subject>;

    /**
     * Custom command for checking ARIA roles
     * @example cy.checkAriaRole('#element', 'button')
     */
    checkAriaRole(selector: string, expectedRole: string): Chainable<Subject>;

    /**
     * Custom command to bypass login by directly setting localStorage
     * @example cy.loginByLocalStorage('admin')
     */
    loginByLocalStorage(role?: string): Chainable<Subject>;
  }
}
