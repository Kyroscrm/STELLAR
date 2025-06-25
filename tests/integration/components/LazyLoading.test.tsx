import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../../../src/App';
import { AuthProvider } from '../../../src/contexts/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

jest.mock('../../../src/components/SuspenseLoader', () => ({
  __esModule: true,
  default: () => <div data-testid="suspense-loader">Loading...</div>,
}));

describe('Lazy Loading', () => {
  it('shows suspense loader while loading lazy routes', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <MemoryRouter initialEntries={['/admin/leads']}>
            <App />
          </MemoryRouter>
        </AuthProvider>
      </QueryClientProvider>
    );

    // Initially shows the loader
    expect(screen.getByTestId('suspense-loader')).toBeInTheDocument();

    // Wait for the page to load
    await waitFor(() => {
      expect(screen.queryByTestId('suspense-loader')).not.toBeInTheDocument();
    });

    // Verify the page content is loaded
    expect(screen.getByText('Leads Management')).toBeInTheDocument();
  });
});
