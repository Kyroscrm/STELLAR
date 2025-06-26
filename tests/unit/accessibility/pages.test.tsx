import React from 'react';
import { render, act } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthProvider } from '../../../src/contexts/AuthContext';
import { TourProvider } from '../../../src/contexts/TourContext';
import LeadsPage from '../../../src/pages/LeadsPage';
import CustomersPage from '../../../src/pages/CustomersPage';
import EstimatesPage from '../../../src/pages/EstimatesPage';
import InvoicesPage from '../../../src/pages/InvoicesPage';
import TasksPage from '../../../src/pages/TasksPage';
import AdminDashboard from '../../../src/pages/AdminDashboard';

// Mock tour steps
vi.mock('@/lib/tour-steps', () => ({
  mainTourSteps: [],
  leadsTourSteps: [],
  estimatesTourSteps: [],
  invoicesTourSteps: [],
  jobsTourSteps: [],
  tasksTourSteps: [],
}));

// Add jest-axe matchers
expect.extend(toHaveNoViolations);

// Create a wrapper component with all required providers
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      gcTime: 0,
      staleTime: 0,
    },
  },
});

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>{children}</AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

describe('Page Accessibility Tests', () => {
  beforeEach(() => {
    queryClient.clear();
  });

  it('LeadsPage should have no accessibility violations', async () => {
    const { container } = render(<LeadsPage />, {
      wrapper: AllTheProviders,
    });

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('CustomersPage should have no accessibility violations', async () => {
    const { container } = render(<CustomersPage />, { wrapper: AllTheProviders });
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('EstimatesPage should have no accessibility violations', async () => {
    const { container } = render(<EstimatesPage />, { wrapper: AllTheProviders });
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('InvoicesPage should have no accessibility violations', async () => {
    const { container } = render(<InvoicesPage />, { wrapper: AllTheProviders });
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('TasksPage should have no accessibility violations', async () => {
    const { container } = render(<TasksPage />, { wrapper: AllTheProviders });
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('AdminDashboard should have no accessibility violations', async () => {
    const { container } = render(<AdminDashboard />, { wrapper: AllTheProviders });
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
