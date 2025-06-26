import React from 'react';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { AccessibleForm } from '../../../src/components/ui/accessible-form';
import { AccessibleInput } from '../../../src/components/ui/accessible-input';
import { AccessibleSelect } from '../../../src/components/ui/accessible-select';

expect.extend(toHaveNoViolations);

describe('Form Accessibility Tests', () => {
  it('AccessibleForm should have no accessibility violations', async () => {
    const { container } = render(
      <AccessibleForm aria-label="Test Form">
        <div>Form content</div>
      </AccessibleForm>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('AccessibleInput should have no accessibility violations', async () => {
    const { container } = render(
      <AccessibleInput
        label="Test Input"
        id="test-input"
        type="text"
        required
        helpText="This is a help text"
      />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('AccessibleSelect should have no accessibility violations', async () => {
    const { container } = render(
      <AccessibleSelect
        label="Test Select"
        id="test-select"
        required
        options={[
          { value: '1', label: 'Option 1' },
          { value: '2', label: 'Option 2' },
        ]}
      />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Form with error states should have no accessibility violations', async () => {
    const { container } = render(
      <AccessibleForm aria-label="Test Form" hasErrors errorMessage="Form has errors">
        <AccessibleInput
          label="Test Input"
          id="test-input"
          type="text"
          required
          error="This field has an error"
        />
        <AccessibleSelect
          label="Test Select"
          id="test-select"
          required
          error="This field has an error"
          options={[
            { value: '1', label: 'Option 1' },
            { value: '2', label: 'Option 2' },
          ]}
        />
      </AccessibleForm>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
