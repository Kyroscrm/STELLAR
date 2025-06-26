import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { axe, toHaveNoViolations } from 'jest-axe';
import { AccessibleForm } from '../../../src/components/ui/accessible-form';
import { AccessibleModal } from '../../../src/components/ui/accessible-modal';
import { AccessibleInput } from '../../../src/components/ui/accessible-input';
import { AccessibleSelect } from '../../../src/components/ui/accessible-select';
import { AccessibleTable } from '../../../src/components/ui/accessible-table';
import { AccessibleTabs } from '../../../src/components/ui/accessible-tabs';
import { AccessibleTooltip } from '../../../src/components/ui/accessible-tooltip';
import { AccessibleButton } from '../../../src/components/ui/accessible-button';

expect.extend(toHaveNoViolations);

describe('Accessible Components', () => {
  describe('AccessibleForm', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(
        <AccessibleForm aria-label="Test Form">
          <input type="text" aria-label="Test Input" />
        </AccessibleForm>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should display error message correctly', () => {
      render(
        <AccessibleForm
          hasErrors
          errorMessage="Test error message"
          aria-label="Test Form"
        >
          <input type="text" aria-label="Test Input" />
        </AccessibleForm>
      );
      expect(screen.getByRole('alert')).toHaveTextContent('Test error message');
    });
  });

  describe('AccessibleModal', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(
        <AccessibleModal
          isOpen={true}
          onClose={() => {}}
          title="Test Modal"
          description="Test Description"
        >
          <p>Modal content</p>
        </AccessibleModal>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should handle escape key', () => {
      const onClose = jest.fn();
      render(
        <AccessibleModal
          isOpen={true}
          onClose={onClose}
          title="Test Modal"
        >
          <p>Modal content</p>
        </AccessibleModal>
      );
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('AccessibleInput', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(
        <AccessibleInput
          label="Test Input"
          helpText="Help text"
          required
        />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should show error message correctly', () => {
      render(
        <AccessibleInput
          label="Test Input"
          error="Test error"
        />
      );
      expect(screen.getByRole('alert')).toHaveTextContent('Test error');
    });
  });

  describe('AccessibleSelect', () => {
    const options = [
      { value: '1', label: 'Option 1' },
      { value: '2', label: 'Option 2' },
      { value: '3', label: 'Option 3', disabled: true }
    ];

    it('should have no accessibility violations', async () => {
      const { container } = render(
        <AccessibleSelect
          label="Test Select"
          options={options}
          helpText="Help text"
          required
        />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should render all options correctly', () => {
      render(
        <AccessibleSelect
          label="Test Select"
          options={options}
        />
      );
      expect(screen.getAllByRole('option')).toHaveLength(3);
      expect(screen.getByText('Option 3')).toHaveAttribute('disabled');
    });
  });

  describe('AccessibleTable', () => {
    const columns = [
      { header: 'Name', accessor: 'name' as const },
      { header: 'Age', accessor: 'age' as const },
    ];

    const data = [
      { name: 'John', age: 25 },
      { name: 'Jane', age: 30 },
    ];

    it('should have no accessibility violations', async () => {
      const { container } = render(
        <AccessibleTable
          columns={columns}
          data={data}
          caption="Test Table"
        />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should handle sorting', () => {
      render(
        <AccessibleTable
          columns={columns}
          data={data}
          caption="Test Table"
        />
      );
      const nameHeader = screen.getByText('Name');
      fireEvent.click(nameHeader);
      const cells = screen.getAllByRole('gridcell');
      expect(cells[0]).toHaveTextContent('Jane');
    });

    it('should handle keyboard navigation', () => {
      render(
        <AccessibleTable
          columns={columns}
          data={data}
          caption="Test Table"
        />
      );
      const firstCell = screen.getAllByRole('gridcell')[0];
      fireEvent.keyDown(firstCell, { key: 'ArrowRight' });
      expect(document.activeElement).toBe(screen.getAllByRole('gridcell')[1]);
    });

    it('should handle keyboard navigation with Home/End keys', () => {
      const { getAllByRole } = render(
        <AccessibleTable
          columns={columns}
          data={data}
          caption="Test Table"
        />
      );
      const cells = getAllByRole('gridcell');
      const firstCell = cells[0];
      const lastCell = cells[cells.length - 1];

      // Test Home key
      fireEvent.keyDown(firstCell, { key: 'Home' });
      expect(document.activeElement).toBe(cells[0]);

      // Test End key
      fireEvent.keyDown(lastCell, { key: 'End' });
      expect(document.activeElement).toBe(cells[cells.length - 1]);

      // Test Ctrl+Home
      fireEvent.keyDown(firstCell, { key: 'Home', ctrlKey: true });
      expect(document.activeElement).toBe(cells[0]);

      // Test Ctrl+End
      fireEvent.keyDown(lastCell, { key: 'End', ctrlKey: true });
      expect(document.activeElement).toBe(cells[cells.length - 1]);
    });

    it('should handle pagination with keyboard', () => {
      const longData = Array.from({ length: 15 }, (_, i) => ({
        name: `Person ${i + 1}`,
        age: 20 + i
      }));

      const { getByRole, getAllByRole } = render(
        <AccessibleTable
          columns={columns}
          data={longData}
          caption="Test Table"
          rowsPerPage={10}
        />
      );

      const firstCell = getAllByRole('gridcell')[0];

      // Test PageDown key
      fireEvent.keyDown(firstCell, { key: 'PageDown' });
      expect(getByRole('status')).toHaveTextContent('Page 2 of 2');

      // Test PageUp key
      fireEvent.keyDown(firstCell, { key: 'PageUp' });
      expect(getByRole('status')).toHaveTextContent('Page 1 of 2');
    });

    it('should announce sort changes', () => {
      const { getByText, getByRole } = render(
        <AccessibleTable
          columns={columns}
          data={data}
          caption="Test Table"
        />
      );

      const nameHeader = getByText('Name');
      fireEvent.click(nameHeader);
      expect(getByRole('status')).toHaveTextContent('Sorted Name ascending');

      fireEvent.click(nameHeader);
      expect(getByRole('status')).toHaveTextContent('Sorted Name descending');
    });
  });

  describe('AccessibleTabs', () => {
    const tabs = [
      { id: 'tab1', label: 'Tab 1', content: 'Content 1' },
      { id: 'tab2', label: 'Tab 2', content: 'Content 2' },
      { id: 'tab3', label: 'Tab 3', content: 'Content 3', disabled: true },
    ];

    it('should have no accessibility violations', async () => {
      const { container } = render(
        <AccessibleTabs
          tabs={tabs}
          label="Test Tabs"
        />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should handle tab selection', () => {
      const onChange = jest.fn();
      render(
        <AccessibleTabs
          tabs={tabs}
          label="Test Tabs"
          onChange={onChange}
        />
      );
      const secondTab = screen.getByRole('tab', { name: 'Tab 2' });
      fireEvent.click(secondTab);
      expect(onChange).toHaveBeenCalledWith('tab2');
      expect(screen.getByText('Content 2')).toBeVisible();
    });

    it('should handle keyboard navigation', () => {
      render(
        <AccessibleTabs
          tabs={tabs}
          label="Test Tabs"
        />
      );
      const firstTab = screen.getByRole('tab', { name: 'Tab 1' });
      firstTab.focus();
      fireEvent.keyDown(firstTab, { key: 'ArrowRight' });
      expect(document.activeElement).toBe(screen.getByRole('tab', { name: 'Tab 2' }));
    });

    it('should skip disabled tabs in keyboard navigation', () => {
      render(
        <AccessibleTabs
          tabs={tabs}
          label="Test Tabs"
        />
      );
      const secondTab = screen.getByRole('tab', { name: 'Tab 2' });
      secondTab.focus();
      fireEvent.keyDown(secondTab, { key: 'ArrowRight' });
      expect(document.activeElement).toBe(screen.getByRole('tab', { name: 'Tab 1' }));
    });
  });

  describe('AccessibleTooltip', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(
        <AccessibleTooltip content="Tooltip content">
          <button>Trigger</button>
        </AccessibleTooltip>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should show tooltip on hover', () => {
      render(
        <AccessibleTooltip content="Tooltip content">
          <button>Trigger</button>
        </AccessibleTooltip>
      );
      const trigger = screen.getByText('Trigger');
      fireEvent.mouseEnter(trigger);
      expect(screen.getByRole('tooltip')).toBeInTheDocument();
    });

    it('should show tooltip on focus', () => {
      render(
        <AccessibleTooltip content="Tooltip content">
          <button>Trigger</button>
        </AccessibleTooltip>
      );
      const trigger = screen.getByText('Trigger');
      fireEvent.focus(trigger);
      expect(screen.getByRole('tooltip')).toBeInTheDocument();
    });

    it('should hide tooltip on escape', () => {
      render(
        <AccessibleTooltip content="Tooltip content">
          <button>Trigger</button>
        </AccessibleTooltip>
      );
      const trigger = screen.getByText('Trigger');
      fireEvent.mouseEnter(trigger);
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });
  });

  describe('AccessibleButton', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(
        <AccessibleButton>Test Button</AccessibleButton>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should handle loading state correctly', () => {
      const { getByRole, getByText } = render(
        <AccessibleButton loading>Test Button</AccessibleButton>
      );
      expect(getByRole('button')).toBeDisabled();
      expect(getByText('Loading...')).toBeInTheDocument();
      expect(getByRole('status')).toHaveTextContent('Loading, please wait...');
    });

    it('should handle keyboard interaction', () => {
      const handleClick = jest.fn();
      const { getByRole } = render(
        <AccessibleButton onClick={handleClick}>Test Button</AccessibleButton>
      );
      const button = getByRole('button');
      fireEvent.keyDown(button, { key: 'Enter' });
      expect(handleClick).toHaveBeenCalled();
      handleClick.mockClear();
      fireEvent.keyDown(button, { key: ' ' });
      expect(handleClick).toHaveBeenCalled();
    });
  });
});
