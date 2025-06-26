/// <reference types="cypress" />
/// <reference types="cypress-axe" />
/// <reference path="./types.ts" />

// Custom command to check text content of elements
Cypress.Commands.add('checkElementsText', { prevSubject: true }, (subject, expectedText) => {
  cy.wrap(subject).each(($el) => {
    cy.wrap($el).invoke('text').then((text) => {
      expect(text.trim()).to.equal(expectedText);
    });
  });
});

// Custom command for keyboard tab navigation
Cypress.Commands.add('tab', { prevSubject: 'optional' }, (subject) => {
  if (subject) {
    cy.wrap(subject).trigger('keydown', { keyCode: 9 });
  } else {
    cy.focused().trigger('keydown', { keyCode: 9 });
  }
  return cy.focused();
});

// Custom command for checking accessibility
Cypress.Commands.add('checkA11y', (context = null, options = {}) => {
  cy.injectAxe();
  cy.checkA11y(context, {
    runOnly: {
      type: 'tag',
      values: ['wcag2a', 'wcag2aa']
    },
    ...options
  });
});

// Custom command for checking focus
Cypress.Commands.add('assertFocus', (selector: string) => {
  cy.get(selector).should('be.focused');
});

// Custom command for checking ARIA attributes
Cypress.Commands.add('checkAriaLabel', (selector: string, expectedLabel: string) => {
  cy.get(selector).should('have.attr', 'aria-label', expectedLabel);
});

// Custom command for checking ARIA roles
Cypress.Commands.add('checkAriaRole', (selector: string, expectedRole: string) => {
  cy.get(selector).should('have.attr', 'role', expectedRole);
});

// Custom command to bypass login by directly setting localStorage
Cypress.Commands.add('loginByLocalStorage', (role = 'admin') => {
  // Create a fake auth token
  const fakeAuthToken = 'fake-jwt-token';

  // Create a fake user object based on role
  const fakeUser = {
    id: '123',
    email: role === 'admin' ? 'admin@example.com' : 'user@example.com',
    role: role,
    user_metadata: {
      name: role === 'admin' ? 'Admin User' : 'Regular User'
    }
  };

  // Create a fake session object
  const fakeSession = {
    access_token: fakeAuthToken,
    refresh_token: 'fake-refresh-token',
    expires_at: Date.now() + 3600000, // 1 hour from now
    user: fakeUser
  };

  // Set localStorage items that Supabase uses for auth
  localStorage.setItem('supabase.auth.token', JSON.stringify({
    currentSession: fakeSession,
    expiresAt: Date.now() + 3600000
  }));

  // Also set a cookie for additional auth
  cy.setCookie('sb-auth-token', fakeAuthToken);
});
