import { renderHook, act } from '@testing-library/react';
import { useEstimates } from '../../../src/hooks/useEstimates';
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

describe('useEstimates Integration Tests', () => {
  const SUPABASE_URL = 'https://your-supabase-url.supabase.co';

  describe('fetchEstimates', () => {
    // Happy path
    test('should fetch estimates successfully', async () => {
      const { result } = renderHook(() => useEstimates());

      await act(async () => {
        await result.current.fetchEstimates();
      });

      expect(result.current.estimates).toEqual(mockEstimates);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(null);
    });

    // Failure scenario
    test('should handle unauthorized error', async () => {
      // Override the default handler for this test
      server.use(
        rest.post(`${SUPABASE_URL}/rest/v1/rpc/has_permission`, (req, res, ctx) => {
          return res(ctx.json(false));
        })
      );

      const { result } = renderHook(() => useEstimates());

      await act(async () => {
        await result.current.fetchEstimates();
      });

      expect(result.current.estimates).toEqual([]);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).not.toBe(null);
      expect(result.current.error?.message).toContain('Permission');
    });
  });

  describe('createEstimate', () => {
    // Happy path with optimistic update
    test('should create estimate successfully with optimistic update', async () => {
      const newEstimate = {
        customer_id: mockCustomers[0].id,
        total_amount: 1500,
        status: 'draft',
      };

      const { result } = renderHook(() => useEstimates());

      // First load estimates
      await act(async () => {
        await result.current.fetchEstimates();
      });

      const initialEstimatesCount = result.current.estimates.length;

      // Then create a new estimate
      let estimate;
      await act(async () => {
        estimate = await result.current.createEstimate(newEstimate);
      });

      expect(estimate).not.toBe(null);
      expect(estimate?.customer_id).toBe(newEstimate.customer_id);
      expect(estimate?.total_amount).toBe(newEstimate.total_amount);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(null);

      // Check if the estimate was added to the local state (optimistic update)
      expect(result.current.estimates.length).toBe(initialEstimatesCount + 1);
      const addedEstimate = result.current.estimates.find(e => e.customer_id === newEstimate.customer_id && e.total_amount === newEstimate.total_amount);
      expect(addedEstimate).not.toBe(undefined);
    });

    // Failure scenario with optimistic rollback
    test('should handle server error and rollback optimistic update', async () => {
      // Override the create handler to return an error
      server.use(
        rest.post(`${SUPABASE_URL}/rest/v1/estimates`, (req, res, ctx) => {
          return res(
            ctx.status(500),
            ctx.json({ error: 'Internal Server Error' })
          );
        })
      );

      const newEstimate = {
        customer_id: mockCustomers[0].id,
        total_amount: 2000,
        status: 'draft',
      };

      const { result } = renderHook(() => useEstimates());

      // First load estimates
      await act(async () => {
        await result.current.fetchEstimates();
      });

      const initialEstimatesCount = result.current.estimates.length;

      // Then try to create a new estimate
      let estimate;
      await act(async () => {
        estimate = await result.current.createEstimate(newEstimate);
      });

      expect(estimate).toBe(null);
      expect(result.current.error).not.toBe(null);

      // Check if the estimate was not added to the local state (rollback)
      expect(result.current.estimates.length).toBe(initialEstimatesCount);
    });
  });

  describe('updateEstimate', () => {
    // Happy path with optimistic update
    test('should update estimate successfully with optimistic update', async () => {
      const estimateId = mockEstimates[0].id;
      const updates = {
        total_amount: 2500,
        status: 'sent',
      };

      const { result } = renderHook(() => useEstimates());

      // First load estimates
      await act(async () => {
        await result.current.fetchEstimates();
      });

      // Then update an estimate
      let success;
      await act(async () => {
        success = await result.current.updateEstimate(estimateId, updates);
      });

      expect(success).toBe(true);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(null);

      // Check if the estimate was updated in the local state (optimistic update)
      const updatedEstimate = result.current.estimates.find(e => e.id === estimateId);
      expect(updatedEstimate).not.toBe(undefined);
      expect(updatedEstimate?.total_amount).toBe(updates.total_amount);
      expect(updatedEstimate?.status).toBe(updates.status);
    });
  });
});
