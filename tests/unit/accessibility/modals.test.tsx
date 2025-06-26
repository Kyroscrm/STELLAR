import React from 'react';
import { render, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { AccessibleModal } from '../../../src/components/ui/accessible-modal';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '../../../src/components/ui/dialog';
import { AlertDialog, AlertDialogContent, AlertDialogTitle, AlertDialogDescription } from '../../../src/components/ui/alert-dialog';

expect.extend(toHaveNoViolations);

describe('Modal Accessibility Tests', () => {
  it('AccessibleModal should have no accessibility violations', async () => {
    const { container } = render(
      <AccessibleModal
        isOpen={true}
        onClose={() => {}}
        title="Test Modal"
        description="This is a test modal"
      >
        <div>Modal content</div>
      </AccessibleModal>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Dialog should have no accessibility violations', async () => {
    const { container } = render(
      <Dialog open={true}>
        <DialogContent>
          <DialogTitle>Test Dialog</DialogTitle>
          <DialogDescription>This is a test dialog description.</DialogDescription>
          <div>Dialog content</div>
        </DialogContent>
      </Dialog>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('AlertDialog should have no accessibility violations', async () => {
    const { container } = render(
      <AlertDialog open={true}>
        <AlertDialogContent>
          <AlertDialogTitle>Test Alert</AlertDialogTitle>
          <AlertDialogDescription>This is a test alert description.</AlertDialogDescription>
          <div>Alert content</div>
        </AlertDialogContent>
      </AlertDialog>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Modal with form content should have no accessibility violations', async () => {
    const { container } = render(
      <AccessibleModal
        isOpen={true}
        onClose={() => {}}
        title="Test Form Modal"
        description="This is a test form modal"
      >
        <form>
          <label htmlFor="test-input">Test Input</label>
          <input
            id="test-input"
            type="text"
            aria-required="true"
            aria-label="Test Input"
          />
          <button type="submit">Submit</button>
        </form>
      </AccessibleModal>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Modal focus management should work correctly', async () => {
    const user = userEvent.setup();

    const rendered = render(
      <AccessibleModal
        isOpen={true}
        onClose={() => {}}
        title="Test Modal"
        description="This is a test modal"
      >
        <button>First Button</button>
        <button>Second Button</button>
        <button>Third Button</button>
      </AccessibleModal>
    );

    // Initial focus should be on close button
    expect(document.activeElement).toBe(rendered.getByLabelText('Close modal'));

    // Tab should move to first button
    await user.tab();
    expect(document.activeElement).toBe(rendered.getByText('First Button'));

    // Tab should move to second button
    await user.tab();
    expect(document.activeElement).toBe(rendered.getByText('Second Button'));

    // Tab should move to third button
    await user.tab();
    expect(document.activeElement).toBe(rendered.getByText('Third Button'));

    // Tab should cycle back to close button
    await user.tab();
    expect(document.activeElement).toBe(rendered.getByLabelText('Close modal'));

    // Shift+Tab should cycle backwards
    await user.tab({ shift: true });
    expect(document.activeElement).toBe(rendered.getByText('Third Button'));
  });
});
