/// <reference types="cypress" />
/// <reference types="cypress-axe" />

declare namespace Cypress {
  interface Chainable<Subject> {
    /**
     * Custom command to inject axe-core into the page
     */
    injectAxe(): void;

    /**
     * Custom command to check accessibility
     */
    checkA11y(
      context?: string | Node,
      options?: {
        runOnly?: {
          type: 'tag' | 'rule';
          values: string[];
        };
        rules?: Record<string, unknown>;
        disable?: string[];
      }
    ): void;

    /**
     * Custom command to tab through elements
     */
    tab(): Chainable<Subject>;

    /**
     * Custom command to assert focus on element
     */
    assertFocus(selector: string): void;

    /**
     * Custom command to check aria-label attribute
     */
    checkAriaLabel(selector: string, expectedLabel: string): void;

    checkAriaRole(selector: string, expectedRole: string): void;
  }
}
