import { setupServer } from 'msw/node';
import { rest } from 'msw';
import { mockCustomers, mockLeads, mockEstimates, mockInvoices, mockUser } from './supabaseClient';

// Base URL for Supabase API
const SUPABASE_URL = 'https://your-supabase-url.supabase.co';

// Create MSW server
export const server = setupServer(
  // Auth endpoints
  rest.post(`${SUPABASE_URL}/auth/v1/token`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        access_token: 'mock-access-token',
        token_type: 'bearer',
        expires_in: 3600,
        refresh_token: 'mock-refresh-token',
        user: mockUser,
      })
    );
  }),

  // RPC endpoints
  rest.post(`${SUPABASE_URL}/rest/v1/rpc/has_permission`, (req, res, ctx) => {
    const { user_id, permission_name } = req.body as { user_id: string; permission_name: string };

    // Admin has all permissions
    if (user_id === mockUser.id) {
      return res(ctx.json(true));
    }

    // For testing permission denied scenarios
    if (permission_name === 'test:denied') {
      return res(ctx.json(false));
    }

    return res(ctx.json(true));
  }),

  rest.post(`${SUPABASE_URL}/rest/v1/rpc/get_changed_fields`, (req, res, ctx) => {
    const { old_record, new_record } = req.body as { old_record: Record<string, any>; new_record: Record<string, any> };

    const changedFields: string[] = [];
    for (const key in new_record) {
      if (old_record[key] !== new_record[key] || !(key in old_record)) {
        changedFields.push(key);
      }
    }

    return res(ctx.json(changedFields));
  }),

  rest.post(`${SUPABASE_URL}/rest/v1/rpc/get_request_metadata`, (req, res, ctx) => {
    return res(
      ctx.json({
        ip_address: '127.0.0.1',
        user_agent: 'Mozilla/5.0 (Test)',
        session_id: '123e4567-e89b-12d3-a456-426614174000',
      })
    );
  }),

  // Table endpoints
  rest.get(`${SUPABASE_URL}/rest/v1/customers`, (req, res, ctx) => {
    return res(ctx.json(mockCustomers));
  }),

  rest.post(`${SUPABASE_URL}/rest/v1/customers`, (req, res, ctx) => {
    const newCustomer = {
      id: '123e4567-e89b-12d3-a456-426614174099',
      ...req.body,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    return res(ctx.json([newCustomer]));
  }),

  rest.patch(`${SUPABASE_URL}/rest/v1/customers`, (req, res, ctx) => {
    const updatedCustomer = {
      ...mockCustomers[0],
      ...req.body,
      updated_at: new Date().toISOString(),
    };
    return res(ctx.json([updatedCustomer]));
  }),

  rest.delete(`${SUPABASE_URL}/rest/v1/customers`, (req, res, ctx) => {
    return res(ctx.json([]));
  }),

  rest.get(`${SUPABASE_URL}/rest/v1/leads`, (req, res, ctx) => {
    return res(ctx.json(mockLeads));
  }),

  rest.post(`${SUPABASE_URL}/rest/v1/leads`, (req, res, ctx) => {
    const newLead = {
      id: '123e4567-e89b-12d3-a456-426614174100',
      ...req.body,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    return res(ctx.json([newLead]));
  }),

  rest.get(`${SUPABASE_URL}/rest/v1/estimates`, (req, res, ctx) => {
    return res(ctx.json(mockEstimates));
  }),

  rest.post(`${SUPABASE_URL}/rest/v1/estimates`, (req, res, ctx) => {
    const newEstimate = {
      id: '123e4567-e89b-12d3-a456-426614174101',
      ...req.body,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    return res(ctx.json([newEstimate]));
  }),

  rest.get(`${SUPABASE_URL}/rest/v1/invoices`, (req, res, ctx) => {
    return res(ctx.json(mockInvoices));
  }),

  rest.post(`${SUPABASE_URL}/rest/v1/invoices`, (req, res, ctx) => {
    const newInvoice = {
      id: '123e4567-e89b-12d3-a456-426614174102',
      ...req.body,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    return res(ctx.json([newInvoice]));
  }),

  // Unauthorized response for testing
  rest.get(`${SUPABASE_URL}/rest/v1/unauthorized_test`, (req, res, ctx) => {
    return res(
      ctx.status(401),
      ctx.json({ error: 'Unauthorized', message: 'JWT token is invalid' })
    );
  }),
);

// Start server before tests
export const startServer = () => server.listen();

// Reset handlers between tests
export const resetServer = () => server.resetHandlers();

// Close server after tests
export const stopServer = () => server.close();
