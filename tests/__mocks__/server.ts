import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

const SUPABASE_URL = 'https://kmjgbbzbqotorocychzl.supabase.co';

// Define handlers array
const handlers = [
  http.post(`${SUPABASE_URL}/rest/v1/rpc/has_permission`, () => {
    return HttpResponse.json({ has_permission: true });
  }),
  http.get(`${SUPABASE_URL}/rest/v1/leads`, () => {
    return HttpResponse.json([]);
  }),
  http.post(`${SUPABASE_URL}/rest/v1/leads`, () => {
    return HttpResponse.json({ id: 'test-lead-id' });
  }),
  http.patch(`${SUPABASE_URL}/rest/v1/leads`, () => {
    return HttpResponse.json({ success: true });
  }),
  http.get(`${SUPABASE_URL}/rest/v1/customers`, () => {
    return HttpResponse.json([]);
  }),
  http.post(`${SUPABASE_URL}/rest/v1/customers`, () => {
    return HttpResponse.json({ id: 'test-customer-id' });
  }),
  http.patch(`${SUPABASE_URL}/rest/v1/customers`, () => {
    return HttpResponse.json({ success: true });
  }),
  http.get(`${SUPABASE_URL}/rest/v1/estimates`, () => {
    return HttpResponse.json([]);
  }),
  http.post(`${SUPABASE_URL}/rest/v1/estimates`, () => {
    return HttpResponse.json({ id: 'test-estimate-id' });
  }),
  http.patch(`${SUPABASE_URL}/rest/v1/estimates`, () => {
    return HttpResponse.json({ success: true });
  }),
  http.get(`${SUPABASE_URL}/rest/v1/invoices`, () => {
    return HttpResponse.json([]);
  }),
  http.post(`${SUPABASE_URL}/rest/v1/invoices`, () => {
    return HttpResponse.json({ id: 'test-invoice-id' });
  }),
  http.patch(`${SUPABASE_URL}/rest/v1/invoices`, () => {
    return HttpResponse.json({ success: true });
  }),
];

// Setup MSW server with handlers
export const server = setupServer(...handlers);
