describe('Accessible Components', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.injectAxe();
  });

  describe('Form Accessibility', () => {
    it('should navigate form controls using keyboard', () => {
      // Test keyboard navigation through form controls
      cy.get('form').first().as('testForm');
      cy.get('@testForm').find('input').first().focus();
      cy.focused().type('{tab}');
      cy.focused().should('have.attr', 'role');
    });

    it('should announce form errors to screen readers', () => {
      cy.get('form').first().as('testForm');
      cy.get('@testForm').find('input').first().type('invalid');
      cy.get('@testForm').submit();
      cy.get('[role="alert"]').should('exist');
    });

    it('should have no detectable accessibility violations', () => {
      cy.checkA11y('form', {
        runOnly: {
          type: 'tag',
          values: ['wcag2a', 'wcag2aa'],
        },
      });
    });
  });

  describe('Modal Accessibility', () => {
    it('should trap focus within modal when open', () => {
      // Open a modal
      cy.get('button').contains(/open|show/i).first().click();

      // Focus should stay within modal when tabbing
      cy.focused().tab();
      cy.focused().should('be.visible').and('be.within', '[role="dialog"]');

      // Should return to first focusable element after reaching end
      for (let i = 0; i < 10; i++) {
        cy.focused().tab();
      }
      cy.focused().should('be.visible').and('be.within', '[role="dialog"]');
    });

    it('should close modal with escape key', () => {
      // Open a modal
      cy.get('button').contains(/open|show/i).first().click();
      cy.get('[role="dialog"]').should('be.visible');

      // Press escape
      cy.get('body').type('{esc}');
      cy.get('[role="dialog"]').should('not.exist');
    });

    it('should have no detectable accessibility violations', () => {
      // Open a modal
      cy.get('button').contains(/open|show/i).first().click();

      cy.checkA11y('[role="dialog"]', {
        runOnly: {
          type: 'tag',
          values: ['wcag2a', 'wcag2aa'],
        },
      });
    });
  });

  describe('Form Controls Accessibility', () => {
    it('should properly associate labels with inputs', () => {
      cy.get('label').each(($label) => {
        if ($label.attr('for')) {
          cy.get(`#${$label.attr('for')}`).should('exist');
        }
      });
    });

    it('should indicate required fields to screen readers', () => {
      cy.get('input[required], select[required]').each(($input) => {
        cy.wrap($input).should('have.attr', 'aria-required', 'true');
      });
    });

    it('should announce validation errors', () => {
      cy.get('input').first().as('testInput');
      cy.get('@testInput').type('invalid{enter}');
      cy.get('[role="alert"]').should('exist');
    });

    it('should have no detectable accessibility violations', () => {
      cy.checkA11y('input, select', {
        runOnly: {
          type: 'tag',
          values: ['wcag2a', 'wcag2aa'],
        },
      });
    });
  });

  describe('Table Accessibility', () => {
    it('should navigate table using keyboard', () => {
      cy.get('table[role="grid"]').first().as('table');
      cy.get('@table').find('td[role="gridcell"]').first().focus();

      // Test arrow key navigation
      cy.focused().type('{rightArrow}');
      cy.focused().should('have.attr', 'role', 'gridcell');
      cy.focused().type('{downArrow}');
      cy.focused().should('have.attr', 'role', 'gridcell');
    });

    it('should sort table columns', () => {
      cy.get('table[role="grid"]').first().as('table');
      cy.get('@table').find('th button').first().click();
      cy.get('@table').find('th[aria-sort]').should('exist');
    });

    it('should have no detectable accessibility violations', () => {
      cy.get('table[role="grid"]').first().as('table');
      cy.checkA11y('@table', {
        runOnly: {
          type: 'tag',
          values: ['wcag2a', 'wcag2aa'],
        },
      });
    });
  });

  describe('Tabs Accessibility', () => {
    it('should navigate tabs using keyboard', () => {
      cy.get('[role="tablist"]').first().as('tablist');
      cy.get('@tablist').find('[role="tab"]').first().focus();

      // Test arrow key navigation
      cy.focused().type('{rightArrow}');
      cy.focused().should('have.attr', 'role', 'tab');
      cy.focused().should('have.attr', 'aria-selected', 'true');
    });

    it('should activate tab panel on selection', () => {
      cy.get('[role="tablist"]').first().as('tablist');
      cy.get('@tablist').find('[role="tab"]').eq(1).click();
      cy.get('[role="tabpanel"]').should('be.visible');
    });

    it('should skip disabled tabs', () => {
      cy.get('[role="tablist"]').first().as('tablist');
      cy.get('@tablist').find('[role="tab"][disabled]').should('have.attr', 'aria-disabled', 'true');
    });

    it('should have no detectable accessibility violations', () => {
      cy.get('[role="tablist"]').first().parent().as('tabComponent');
      cy.checkA11y('@tabComponent', {
        runOnly: {
          type: 'tag',
          values: ['wcag2a', 'wcag2aa'],
        },
      });
    });
  });

  describe('Tooltip Accessibility', () => {
    it('should show tooltip on hover and focus', () => {
      cy.get('[aria-describedby]').first().as('trigger');

      // Test hover
      cy.get('@trigger').trigger('mouseenter');
      cy.get('[role="tooltip"]').should('be.visible');

      // Test focus
      cy.get('@trigger').focus();
      cy.get('[role="tooltip"]').should('be.visible');
    });

    it('should hide tooltip on escape', () => {
      cy.get('[aria-describedby]').first().as('trigger');
      cy.get('@trigger').trigger('mouseenter');
      cy.get('body').type('{esc}');
      cy.get('[role="tooltip"]').should('not.exist');
    });

    it('should have no detectable accessibility violations', () => {
      cy.get('[aria-describedby]').first().as('trigger');
      cy.get('@trigger').trigger('mouseenter');
      cy.get('[role="tooltip"]').parent().as('tooltipComponent');
      cy.checkA11y('@tooltipComponent', {
        runOnly: {
          type: 'tag',
          values: ['wcag2a', 'wcag2aa'],
        },
      });
    });
  });
});
