import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { useEstimates } from '../../../src/hooks/useEstimates';
import { useInvoices } from '../../../src/hooks/useInvoices';
import { mockEstimates, mockCustomers } from '../../__mocks__/supabaseClient';
import { server, startServer, stopServer, resetServer } from '../../__mocks__/supabaseServer';
import { rest } from 'msw';

// Set up MSW server before tests
beforeAll(() => startServer());
// Reset handlers between tests
afterEach(() => resetServer());
// Clean up after tests
afterAll(() => stopServer());

// Mock the AuthContext
jest.mock('../../../src/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: '123e4567-e89b-12d3-a456-426614174000' },
    session: { access_token: 'mock-token' }
  })
}));

// Test component that uses both hooks
const EstimateToInvoiceComponent = () => {
  const { estimates, loading: estimatesLoading, error: estimatesError, fetchEstimates, updateEstimate } = useEstimates();
  const { invoices, loading: invoicesLoading, error: invoicesError, createInvoiceFromEstimate } = useInvoices();

  const handleCreateInvoice = async (estimateId: string) => {
    await createInvoiceFromEstimate(estimateId);
    // Mark the estimate as converted
    await updateEstimate(estimateId, { status: 'converted' });
  };

  return (
    <div>
      <h1>Estimate to Invoice Conversion</h1>
      {estimatesLoading && <div data-testid="estimates-loading">Loading estimates...</div>}
      {estimatesError && <div data-testid="estimates-error">Error: {estimatesError.message}</div>}
      {invoicesLoading && <div data-testid="invoices-loading">Loading invoices...</div>}
      {invoicesError && <div data-testid="invoices-error">Error: {invoicesError.message}</div>}

      <button onClick={() => fetchEstimates()}>Load Estimates</button>

      <ul>
        {estimates.map(estimate => (
          <li key={estimate.id}>
            Estimate #{estimate.id} - ${estimate.total_amount} - {estimate.status}
            <button
              data-testid={`convert-${estimate.id}`}
              onClick={() => handleCreateInvoice(estimate.id)}
              disabled={estimate.status === 'converted'}
            >
              Convert to Invoice
            </button>
          </li>
        ))}
      </ul>

      <h2>Invoices</h2>
      <ul>
        {invoices.map(invoice => (
          <li key={invoice.id}>
            Invoice #{invoice.id} - ${invoice.total_amount} - {invoice.status}
          </li>
        ))}
      </ul>
    </div>
  );
};

describe('Estimate to Invoice Flow', () => {
  const SUPABASE_URL = 'https://your-supabase-url.supabase.co';

  test('should convert estimate to invoice and update estimate status', async () => {
    // Set up test data
    const testEstimate = mockEstimates[0];
    const newInvoiceId = '123e4567-e89b-12d3-a456-426614174102';

    // Render the component
    render(<EstimateToInvoiceComponent />);

    // Click the load estimates button
    fireEvent.click(screen.getByText('Load Estimates'));

    // Wait for estimates to load
    await waitFor(() => {
      expect(screen.getByText(`Estimate #${testEstimate.id} - $${testEstimate.total_amount} - ${testEstimate.status}`)).toBeInTheDocument();
    });

    // Click the convert button for the first estimate
    fireEvent.click(screen.getByTestId(`convert-${testEstimate.id}`));

    // Wait for the invoice to be created and estimate to be updated
    await waitFor(() => {
      // Check if invoice was created
      expect(screen.getByText(new RegExp(`Invoice #${newInvoiceId}`))).toBeInTheDocument();

      // Check if estimate status was updated to 'converted'
      expect(screen.getByText(new RegExp(`Estimate #${testEstimate.id}.*converted`))).toBeInTheDocument();
    });
  });

  test('should handle errors when converting estimate to invoice', async () => {
    // Override the create invoice handler to return an error
    server.use(
      rest.post(`${SUPABASE_URL}/rest/v1/invoices`, (req, res, ctx) => {
        return res(
          ctx.status(500),
          ctx.json({ error: 'Internal Server Error' })
        );
      })
    );

    // Render the component
    render(<EstimateToInvoiceComponent />);

    // Click the load estimates button
    fireEvent.click(screen.getByText('Load Estimates'));

    // Wait for estimates to load
    await waitFor(() => {
      expect(screen.queryByTestId('estimates-loading')).not.toBeInTheDocument();
    });

    // Click the convert button for the first estimate
    fireEvent.click(screen.getByTestId(`convert-${mockEstimates[0].id}`));

    // Wait for the error to appear
    await waitFor(() => {
      expect(screen.getByTestId('invoices-error')).toBeInTheDocument();
    });
  });
});
