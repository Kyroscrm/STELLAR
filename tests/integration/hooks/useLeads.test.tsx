import { renderHook, act } from '@testing-library/react';
import { useLeads } from '../../../src/hooks/useLeads';
import { mockLeads } from '../../__mocks__/supabaseClient';
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

describe('useLeads Integration Tests', () => {
  const SUPABASE_URL = 'https://your-supabase-url.supabase.co';

  describe('fetchLeads', () => {
    // Happy path - 200 OK with array
    test('should fetch leads successfully', async () => {
      const { result } = renderHook(() => useLeads());

      await act(async () => {
        await result.current.fetchLeads();
      });

      expect(result.current.leads).toEqual(mockLeads);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(null);
    });

    // Failure scenario - 401 unauthorized
    test('should handle unauthorized error', async () => {
      // Override the default handler for this test
      server.use(
        rest.get(`${SUPABASE_URL}/rest/v1/leads`, (req, res, ctx) => {
          return res(
            ctx.status(401),
            ctx.json({ error: 'Unauthorized', message: 'JWT token is invalid' })
          );
        }),
        rest.post(`${SUPABASE_URL}/rest/v1/rpc/has_permission`, (req, res, ctx) => {
          return res(ctx.json(false));
        })
      );

      const { result } = renderHook(() => useLeads());

      await act(async () => {
        await result.current.fetchLeads();
      });

      expect(result.current.leads).toEqual([]);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).not.toBe(null);
      expect(result.current.error?.message).toContain('Permission');
    });

    // Edge case - server error
    test('should handle server error', async () => {
      // Override the default handler for this test
      server.use(
        rest.get(`${SUPABASE_URL}/rest/v1/leads`, (req, res, ctx) => {
          return res(
            ctx.status(500),
            ctx.json({ error: 'Internal Server Error' })
          );
        })
      );

      const { result } = renderHook(() => useLeads());

      await act(async () => {
        await result.current.fetchLeads();
      });

      expect(result.current.leads).toEqual([]);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).not.toBe(null);
    });
  });

  describe('createLead', () => {
    // Happy path
    test('should create lead successfully', async () => {
      const newLead = {
        name: 'New Lead',
        email: 'new@example.com',
        phone: '555-123-4567',
        status: 'new',
        source: 'website'
      };

      const { result } = renderHook(() => useLeads());

      let lead;
      await act(async () => {
        lead = await result.current.createLead(newLead);
      });

      expect(lead).not.toBe(null);
      expect(lead?.name).toBe(newLead.name);
      expect(lead?.email).toBe(newLead.email);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(null);
    });

    // Failure scenario - permission denied
    test('should handle permission denied when creating lead', async () => {
      // Override the default handler for this test
      server.use(
        rest.post(`${SUPABASE_URL}/rest/v1/rpc/has_permission`, (req, res, ctx) => {
          const { permission_name } = req.body as { permission_name: string };
          if (permission_name === 'leads:create') {
            return res(ctx.json(false));
          }
          return res(ctx.json(true));
        })
      );

      const newLead = {
        name: 'New Lead',
        email: 'new@example.com',
        phone: '555-123-4567',
        status: 'new',
        source: 'website'
      };

      const { result } = renderHook(() => useLeads());

      let lead;
      await act(async () => {
        lead = await result.current.createLead(newLead);
      });

      expect(lead).toBe(null);
      expect(result.current.error).not.toBe(null);
      expect(result.current.error?.message).toContain('Permission');
    });
  });

  describe('updateLead', () => {
    // Setup
    beforeEach(() => {
      // Ensure leads are loaded
      server.use(
        rest.get(`${SUPABASE_URL}/rest/v1/leads`, (req, res, ctx) => {
          return res(ctx.json(mockLeads));
        })
      );
    });

    // Happy path
    test('should update lead successfully with optimistic update', async () => {
      const leadId = mockLeads[0].id;
      const updates = {
        name: 'Updated Lead Name',
        status: 'contacted'
      };

      const { result } = renderHook(() => useLeads());

      // First load leads
      await act(async () => {
        await result.current.fetchLeads();
      });

      // Then update a lead
      let success;
      await act(async () => {
        success = await result.current.updateLead(leadId, updates);
      });

      expect(success).toBe(true);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(null);

      // Check if the lead was updated in the local state (optimistic update)
      const updatedLead = result.current.leads.find(lead => lead.id === leadId);
      expect(updatedLead).not.toBe(undefined);
      expect(updatedLead?.name).toBe(updates.name);
      expect(updatedLead?.status).toBe(updates.status);
    });

    // Failure scenario - server error with optimistic rollback
    test('should handle server error and rollback optimistic update', async () => {
      // Override the update handler to return an error
      server.use(
        rest.patch(`${SUPABASE_URL}/rest/v1/leads`, (req, res, ctx) => {
          return res(
            ctx.status(500),
            ctx.json({ error: 'Internal Server Error' })
          );
        })
      );

      const leadId = mockLeads[0].id;
      const originalName = mockLeads[0].name;
      const updates = {
        name: 'This Update Will Fail',
        status: 'contacted'
      };

      const { result } = renderHook(() => useLeads());

      // First load leads
      await act(async () => {
        await result.current.fetchLeads();
      });

      // Then try to update a lead
      let success;
      await act(async () => {
        success = await result.current.updateLead(leadId, updates);
      });

      expect(success).toBe(false);
      expect(result.current.error).not.toBe(null);

      // Check if the lead was rolled back to original state
      const lead = result.current.leads.find(lead => lead.id === leadId);
      expect(lead?.name).toBe(originalName);
    });
  });
});
