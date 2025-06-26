/// <reference types="cypress" />
import './commands';
import { mount } from 'cypress/react18';

// Augment the Cypress namespace to include type definitions for
// your custom command.
declare global {
  namespace Cypress {
    interface Chainable {
      mount: typeof mount;
    }
  }
}

// Register the mount command
Cypress.Commands.add('mount', mount);

// Import global styles
import '../src/index.css';
