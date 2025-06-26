/// <reference types="cypress" />
import { performance } from 'perf_hooks';

describe('Dashboard Module Tests', () => {
  beforeEach(() => {
    // Reset performance marks
    performance.clearMarks();
    performance.clearMeasures();

    // Login as admin
    cy.login('admin');

    // Wait for dashboard to load
    cy.url().should('include', '/dashboard');
  });

  it('should load dashboard without console errors', () => {
    // Start performance measurement
    performance.mark('dashboard-start');

    // Navigate to dashboard
    cy.visit('/dashboard');

    // Check for console errors
    cy.checkNoConsoleErrors();

    // Verify key dashboard elements are present
    cy.get('[data-testid="dashboard-metrics"]').should('exist');
    cy.get('[data-testid="dashboard-charts"]').should('exist');
    cy.get('[data-testid="recent-activity"]').should('exist');

    // End performance measurement
    performance.mark('dashboard-end');
    performance.measure('dashboard-load', 'dashboard-start', 'dashboard-end');

    // Check performance metrics
    const measure = performance.getEntriesByName('dashboard-load')[0];
    cy.wrap(measure.duration).should('be.lessThan', 500); // Time to interactive < 500ms
  });

  it('should not contain any placeholder/static data', () => {
    cy.visit('/dashboard');
    cy.checkNoPlaceholders();
  });

  it('should handle data refresh correctly', () => {
    cy.visit('/dashboard');

    // Click refresh button
    cy.get('[data-testid="refresh-dashboard"]').click();

    // Verify loading state
    cy.get('[data-testid="dashboard-loading"]').should('exist');
    cy.get('[data-testid="dashboard-loading"]').should('not.exist');

    // Verify data is updated
    cy.get('[data-testid="last-updated"]')
      .invoke('attr', 'datetime')
      .should('not.be.undefined');
  });

  it('should persist dashboard preferences', () => {
    cy.visit('/dashboard');

    // Change a dashboard preference
    cy.get('[data-testid="date-range-selector"]').click();
    cy.get('[data-testid="date-range-30-days"]').click();

    // Reload page
    cy.reload();

    // Verify preference persisted
    cy.get('[data-testid="date-range-selector"]')
      .should('have.text', 'Last 30 Days');
  });

  it('should handle network failures gracefully', () => {
    cy.visit('/dashboard');

    // Simulate network failure
    cy.intercept('GET', '/api/dashboard/metrics', {
      forceNetworkError: true
    }).as('metricsError');

    // Trigger refresh
    cy.get('[data-testid="refresh-dashboard"]').click();

    // Verify error handling
    cy.get('[data-testid="error-message"]')
      .should('exist')
      .and('contain', 'Failed to load dashboard data');

    // Verify retry mechanism
    cy.get('[data-testid="retry-button"]').should('exist');
  });
});
