import { renderHook, act } from '@testing-library/react';
import { useInvoices } from '../../../src/hooks/useInvoices';
import { mockInvoices, mockCustomers } from '../../__mocks__/supabaseClient';
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

describe('useInvoices Integration Tests', () => {
  const SUPABASE_URL = 'https://your-supabase-url.supabase.co';

  describe('fetchInvoices', () => {
    test('should fetch invoices successfully', async () => {
      const { result } = renderHook(() => useInvoices());

      await act(async () => {
        await result.current.fetchInvoices();
      });

      expect(result.current.invoices).toEqual(mockInvoices);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(null);
    });

    test('should handle unauthorized error', async () => {
      // Override the default handler for this test
      server.use(
        rest.post(`${SUPABASE_URL}/rest/v1/rpc/has_permission`, (req, res, ctx) => {
          return res(ctx.json(false));
        })
      );

      const { result } = renderHook(() => useInvoices());

      await act(async () => {
        await result.current.fetchInvoices();
      });

      expect(result.current.invoices).toEqual([]);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).not.toBe(null);
    });
  });

  describe('addInvoice', () => {
    test('should add invoice with optimistic update', async () => {
      const newInvoice = {
        title: 'New Test Invoice',
        customer_id: mockCustomers[0].id,
        due_date: new Date().toISOString().split('T')[0],
        status: 'draft',
        payment_status: 'pending',
        line_items: [
          {
            description: 'Test Item',
            quantity: 2,
            unit_price: 100,
            sort_order: 0
          }
        ]
      };

      const { result } = renderHook(() => useInvoices());

      // First load invoices
      await act(async () => {
        await result.current.fetchInvoices();
      });

      const initialInvoicesCount = result.current.invoices.length;

      // Then add a new invoice
      let invoice;
      await act(async () => {
        invoice = await result.current.addInvoice(newInvoice);
      });

      expect(invoice).not.toBe(null);
      expect(invoice?.title).toBe(newInvoice.title);
      expect(invoice?.customer_id).toBe(newInvoice.customer_id);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(null);

      // Check if the invoice was added to the local state (optimistic update)
      expect(result.current.invoices.length).toBe(initialInvoicesCount + 1);
      const addedInvoice = result.current.invoices.find(i => i.title === newInvoice.title);
      expect(addedInvoice).not.toBe(undefined);
    });

    test('should handle server error and rollback optimistic update', async () => {
      // Override the create handler to return an error
      server.use(
        rest.post(`${SUPABASE_URL}/rest/v1/invoices`, (req, res, ctx) => {
          return res(
            ctx.status(500),
            ctx.json({ error: 'Internal Server Error' })
          );
        })
      );

      const newInvoice = {
        title: 'This Invoice Will Fail',
        customer_id: mockCustomers[0].id,
        due_date: new Date().toISOString().split('T')[0],
        status: 'draft',
        payment_status: 'pending',
        line_items: [
          {
            description: 'Test Item',
            quantity: 1,
            unit_price: 50,
            sort_order: 0
          }
        ]
      };

      const { result } = renderHook(() => useInvoices());

      // First load invoices
      await act(async () => {
        await result.current.fetchInvoices();
      });

      const initialInvoicesCount = result.current.invoices.length;

      // Then try to add a new invoice that will fail
      let invoice;
      await act(async () => {
        invoice = await result.current.addInvoice(newInvoice);
      });

      expect(invoice).toBe(null);
      expect(result.current.error).not.toBe(null);

      // Check if the invoice was not added to the local state (rollback)
      expect(result.current.invoices.length).toBe(initialInvoicesCount);
      const failedInvoice = result.current.invoices.find(i => i.title === newInvoice.title);
      expect(failedInvoice).toBe(undefined);
    });
  });

  describe('updateInvoice', () => {
    test('should update invoice with optimistic update', async () => {
      const invoiceId = mockInvoices[0].id;
      const updates = {
        title: 'Updated Invoice Title',
        status: 'sent',
      };

      const { result } = renderHook(() => useInvoices());

      // First load invoices
      await act(async () => {
        await result.current.fetchInvoices();
      });

      // Then update an invoice
      let success;
      await act(async () => {
        success = await result.current.updateInvoice(invoiceId, updates);
      });

      expect(success).toBe(true);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(null);

      // Check if the invoice was updated in the local state (optimistic update)
      const updatedInvoice = result.current.invoices.find(i => i.id === invoiceId);
      expect(updatedInvoice).not.toBe(undefined);
      expect(updatedInvoice?.title).toBe(updates.title);
      expect(updatedInvoice?.status).toBe(updates.status);
    });

    test('should handle server error and rollback optimistic update', async () => {
      // Override the update handler to return an error
      server.use(
        rest.patch(`${SUPABASE_URL}/rest/v1/invoices`, (req, res, ctx) => {
          return res(
            ctx.status(500),
            ctx.json({ error: 'Internal Server Error' })
          );
        })
      );

      const invoiceId = mockInvoices[0].id;
      const originalTitle = mockInvoices[0].title;
      const updates = {
        title: 'This Update Will Fail',
        status: 'sent',
      };

      const { result } = renderHook(() => useInvoices());

      // First load invoices
      await act(async () => {
        await result.current.fetchInvoices();
      });

      // Then try to update an invoice that will fail
      let success;
      await act(async () => {
        success = await result.current.updateInvoice(invoiceId, updates);
      });

      expect(success).toBe(false);
      expect(result.current.error).not.toBe(null);

      // Check if the invoice was rolled back to original state
      const invoice = result.current.invoices.find(i => i.id === invoiceId);
      expect(invoice?.title).toBe(originalTitle);
    });
  });

  describe('deleteInvoice', () => {
    test('should delete invoice with optimistic update', async () => {
      const invoiceId = mockInvoices[0].id;

      const { result } = renderHook(() => useInvoices());

      // First load invoices
      await act(async () => {
        await result.current.fetchInvoices();
      });

      const initialInvoicesCount = result.current.invoices.length;

      // Then delete an invoice
      let success;
      await act(async () => {
        success = await result.current.deleteInvoice(invoiceId);
      });

      expect(success).toBe(true);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(null);

      // Check if the invoice was removed from the local state (optimistic update)
      expect(result.current.invoices.length).toBe(initialInvoicesCount - 1);
      const deletedInvoice = result.current.invoices.find(i => i.id === invoiceId);
      expect(deletedInvoice).toBe(undefined);
    });

    test('should handle server error and rollback optimistic update', async () => {
      // Override the delete handler to return an error
      server.use(
        rest.delete(`${SUPABASE_URL}/rest/v1/invoices`, (req, res, ctx) => {
          return res(
            ctx.status(500),
            ctx.json({ error: 'Internal Server Error' })
          );
        })
      );

      const invoiceId = mockInvoices[0].id;

      const { result } = renderHook(() => useInvoices());

      // First load invoices
      await act(async () => {
        await result.current.fetchInvoices();
      });

      const initialInvoicesCount = result.current.invoices.length;

      // Then try to delete an invoice that will fail
      let success;
      await act(async () => {
        success = await result.current.deleteInvoice(invoiceId);
      });

      expect(success).toBe(false);
      expect(result.current.error).not.toBe(null);

      // Check if the invoice was not removed from the local state (rollback)
      expect(result.current.invoices.length).toBe(initialInvoicesCount);
      const invoice = result.current.invoices.find(i => i.id === invoiceId);
      expect(invoice).not.toBe(undefined);
    });
  });
});
