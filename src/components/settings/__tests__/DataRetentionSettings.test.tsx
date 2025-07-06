import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { DataRetentionSettings } from '../DataRetentionSettings';
import { useDataRetention } from '@/hooks/useDataRetention';
import { useToast } from '@/hooks/use-toast';

// Mock the hooks
jest.mock('@/hooks/useDataRetention');
jest.mock('@/hooks/use-toast');

const mockPolicies = [
  {
    id: '1',
    table_name: 'leads',
    retention_period_days: 30,
    policy_type: 'automatic',
    compliance_requirement: 'GDPR Article 17',
    auto_delete: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    user_id: 'user-1'
  }
];

const mockUseDataRetention = {
  policies: mockPolicies,
  createPolicy: jest.fn(),
  updatePolicy: jest.fn(),
  deletePolicy: jest.fn(),
  generateRetentionReport: jest.fn(),
  scheduleAutomaticCleanup: jest.fn(),
  isLoading: false,
  error: null
};

const mockUseToast = {
  toast: jest.fn()
};

describe('DataRetentionSettings', () => {
  beforeEach(() => {
    (useDataRetention as jest.Mock).mockReturnValue(mockUseDataRetention);
    (useToast as jest.Mock).mockReturnValue(mockUseToast);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the component with form fields', () => {
    render(<DataRetentionSettings />);

    expect(screen.getByText('Data Retention Policies')).toBeInTheDocument();
    expect(screen.getByText('Table Name')).toBeInTheDocument();
    expect(screen.getByText('Retention Period (Days)')).toBeInTheDocument();
    expect(screen.getByText('Policy Type')).toBeInTheDocument();
    expect(screen.getByText('Compliance Requirement')).toBeInTheDocument();
    expect(screen.getByText('Automatic Deletion')).toBeInTheDocument();
  });

  it('displays existing policies', () => {
    render(<DataRetentionSettings />);

    expect(screen.getByText('leads')).toBeInTheDocument();
    expect(screen.getByText(/30 days/)).toBeInTheDocument();
    expect(screen.getByText('GDPR Article 17')).toBeInTheDocument();
  });

  it('creates a new policy', async () => {
    render(<DataRetentionSettings />);

    // Fill out the form
    await userEvent.selectOptions(screen.getByRole('combobox', { name: /table name/i }), 'customers');
    await userEvent.type(screen.getByRole('spinbutton', { name: /retention period/i }), '60');
    await userEvent.selectOptions(screen.getByRole('combobox', { name: /policy type/i }), 'manual');
    await userEvent.type(screen.getByPlaceholderText(/gdpr article/i), 'CCPA');
    await userEvent.click(screen.getByRole('switch', { name: /automatic deletion/i }));

    // Submit the form
    await userEvent.click(screen.getByRole('button', { name: /create policy/i }));

    await waitFor(() => {
      expect(mockUseDataRetention.createPolicy).toHaveBeenCalledWith({
        table_name: 'customers',
        retention_period_days: 60,
        policy_type: 'manual',
        compliance_requirement: 'CCPA',
        auto_delete: true
      });
    });

    expect(mockUseToast.toast).toHaveBeenCalledWith({
      title: 'Success',
      description: 'Retention policy created successfully',
      variant: 'default'
    });
  });

  it('deletes a policy', async () => {
    render(<DataRetentionSettings />);

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await userEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockUseDataRetention.deletePolicy).toHaveBeenCalledWith('1');
    });

    expect(mockUseToast.toast).toHaveBeenCalledWith({
      title: 'Success',
      description: 'Retention policy deleted successfully',
      variant: 'default'
    });
  });

  it('updates policy auto_delete setting', async () => {
    render(<DataRetentionSettings />);

    const autoDeleteSwitch = screen.getAllByRole('switch')[1]; // Second switch is in the policy list
    await userEvent.click(autoDeleteSwitch);

    await waitFor(() => {
      expect(mockUseDataRetention.updatePolicy).toHaveBeenCalledWith('1', {
        auto_delete: false
      });
    });
  });

  it('generates a retention report', async () => {
    mockUseDataRetention.generateRetentionReport.mockResolvedValueOnce([
      { table_name: 'leads', records_to_delete: 5 },
      { table_name: 'customers', records_to_delete: 3 }
    ]);

    render(<DataRetentionSettings />);

    const reportButton = screen.getByRole('button', { name: /generate report/i });
    await userEvent.click(reportButton);

    await waitFor(() => {
      expect(mockUseDataRetention.generateRetentionReport).toHaveBeenCalled();
    });

    expect(mockUseToast.toast).toHaveBeenCalledWith({
      title: 'Success',
      description: 'Generated report for 2 tables',
      variant: 'default'
    });
  });

  it('enables automatic cleanup', async () => {
    render(<DataRetentionSettings />);

    const enableButton = screen.getByRole('button', { name: /enable automatic cleanup/i });
    await userEvent.click(enableButton);

    await waitFor(() => {
      expect(mockUseDataRetention.scheduleAutomaticCleanup).toHaveBeenCalledWith(true);
    });

    expect(mockUseToast.toast).toHaveBeenCalledWith({
      title: 'Success',
      description: 'Automatic cleanup enabled successfully',
      variant: 'default'
    });
  });

  it('handles errors gracefully', async () => {
    const error = new Error('Failed to create policy');
    mockUseDataRetention.createPolicy.mockRejectedValueOnce(error);

    render(<DataRetentionSettings />);

    // Submit the form without filling it out (will trigger validation)
    await userEvent.click(screen.getByRole('button', { name: /create policy/i }));

    await waitFor(() => {
      expect(mockUseToast.toast).toHaveBeenCalledWith({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    });
  });

  it('disables buttons while loading', () => {
    (useDataRetention as jest.Mock).mockReturnValue({
      ...mockUseDataRetention,
      isLoading: true
    });

    render(<DataRetentionSettings />);

    expect(screen.getByRole('button', { name: /creating policy/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /generate report/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /enable automatic cleanup/i })).toBeDisabled();
  });
});
