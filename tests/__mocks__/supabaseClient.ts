// Mock Supabase client for testing
import { SupabaseClient } from '@supabase/supabase-js';

export const mockUser = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  email: 'test@example.com',
  user_metadata: {
    name: 'Test User',
  },
  app_metadata: {
    role: 'admin',
  },
};

export const mockAuthResponse = {
  data: { user: mockUser, session: { access_token: 'mock-token' } },
  error: null,
};

export const mockErrorResponse = {
  data: null,
  error: { message: 'An error occurred', code: 'ERROR_CODE' },
};

export const mockCustomers = [
  {
    id: '123e4567-e89b-12d3-a456-426614174001',
    name: 'Customer 1',
    email: 'customer1@example.com',
    phone: '123-456-7890',
    address: '123 Main St',
    city: 'Anytown',
    state: 'CA',
    zip: '12345',
    created_at: '2023-01-01T00:00:00.000Z',
    updated_at: '2023-01-01T00:00:00.000Z',
    created_by: mockUser.id,
    updated_by: mockUser.id,
  },
  {
    id: '123e4567-e89b-12d3-a456-426614174002',
    name: 'Customer 2',
    email: 'customer2@example.com',
    phone: '123-456-7891',
    address: '456 Oak St',
    city: 'Othertown',
    state: 'NY',
    zip: '67890',
    created_at: '2023-01-02T00:00:00.000Z',
    updated_at: '2023-01-02T00:00:00.000Z',
    created_by: mockUser.id,
    updated_by: mockUser.id,
  },
];

export const mockLeads = [
  {
    id: '123e4567-e89b-12d3-a456-426614174003',
    name: 'Lead 1',
    email: 'lead1@example.com',
    phone: '123-456-7892',
    status: 'new',
    source: 'website',
    created_at: '2023-01-03T00:00:00.000Z',
    updated_at: '2023-01-03T00:00:00.000Z',
    created_by: mockUser.id,
    updated_by: mockUser.id,
  },
  {
    id: '123e4567-e89b-12d3-a456-426614174004',
    name: 'Lead 2',
    email: 'lead2@example.com',
    phone: '123-456-7893',
    status: 'contacted',
    source: 'referral',
    created_at: '2023-01-04T00:00:00.000Z',
    updated_at: '2023-01-04T00:00:00.000Z',
    created_by: mockUser.id,
    updated_by: mockUser.id,
  },
];

export const mockEstimates = [
  {
    id: '123e4567-e89b-12d3-a456-426614174005',
    customer_id: mockCustomers[0].id,
    total_amount: 1000,
    status: 'draft',
    created_at: '2023-01-05T00:00:00.000Z',
    updated_at: '2023-01-05T00:00:00.000Z',
    created_by: mockUser.id,
    updated_by: mockUser.id,
  },
];

export const mockInvoices = [
  {
    id: '123e4567-e89b-12d3-a456-426614174006',
    customer_id: mockCustomers[0].id,
    total_amount: 1000,
    status: 'unpaid',
    created_at: '2023-01-06T00:00:00.000Z',
    updated_at: '2023-01-06T00:00:00.000Z',
    created_by: mockUser.id,
    updated_by: mockUser.id,
  },
];

export const mockJobs = [
  {
    id: '123e4567-e89b-12d3-a456-426614174007',
    customer_id: mockCustomers[0].id,
    title: 'Job 1',
    description: 'Description for Job 1',
    status: 'scheduled',
    created_at: '2023-01-07T00:00:00.000Z',
    updated_at: '2023-01-07T00:00:00.000Z',
    created_by: mockUser.id,
    updated_by: mockUser.id,
  },
];

export const mockTasks = [
  {
    id: '123e4567-e89b-12d3-a456-426614174008',
    job_id: mockJobs[0].id,
    title: 'Task 1',
    description: 'Description for Task 1',
    status: 'todo',
    created_at: '2023-01-08T00:00:00.000Z',
    updated_at: '2023-01-08T00:00:00.000Z',
    created_by: mockUser.id,
    updated_by: mockUser.id,
  },
];

export const mockActivityLogs = [
  {
    id: '123e4567-e89b-12d3-a456-426614174009',
    user_id: mockUser.id,
    action: 'created',
    entity_type: 'customers',
    entity_id: mockCustomers[0].id,
    description: 'Created customer',
    created_at: '2023-01-09T00:00:00.000Z',
    old_data: null,
    new_data: mockCustomers[0],
    changed_fields: ['name', 'email', 'phone', 'address', 'city', 'state', 'zip'],
    ip_address: '127.0.0.1',
    user_agent: 'Mozilla/5.0',
    session_id: '123e4567-e89b-12d3-a456-426614174010',
  },
];

// Create a mock Supabase client
export const createMockSupabaseClient = (customMocks = {}) => {
  const defaultMocks = {
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
      onAuthStateChange: jest.fn().mockImplementation((callback) => {
        callback('SIGNED_IN', { user: mockUser });
        return { data: { subscription: { unsubscribe: jest.fn() } } };
      }),
      signOut: jest.fn().mockResolvedValue({ error: null }),
    },
    from: jest.fn().mockImplementation((table) => {
      let mockData;
      switch (table) {
        case 'customers':
          mockData = mockCustomers;
          break;
        case 'leads':
          mockData = mockLeads;
          break;
        case 'estimates':
          mockData = mockEstimates;
          break;
        case 'invoices':
          mockData = mockInvoices;
          break;
        case 'jobs':
          mockData = mockJobs;
          break;
        case 'tasks':
          mockData = mockTasks;
          break;
        case 'activity_logs':
          mockData = mockActivityLogs;
          break;
        default:
          mockData = [];
      }

      return {
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: mockData[0], error: null }),
            data: mockData,
            error: null,
          }),
          order: jest.fn().mockReturnValue({
            data: mockData,
            error: null,
          }),
          data: mockData,
          error: null,
        }),
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            data: [{ ...mockData[0], id: '123e4567-e89b-12d3-a456-426614174099' }],
            error: null,
          }),
          data: [{ ...mockData[0], id: '123e4567-e89b-12d3-a456-426614174099' }],
          error: null,
        }),
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            data: [{ ...mockData[0], updated_at: new Date().toISOString() }],
            error: null,
          }),
          match: jest.fn().mockReturnValue({
            data: [{ ...mockData[0], updated_at: new Date().toISOString() }],
            error: null,
          }),
        }),
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            data: [],
            error: null,
          }),
          match: jest.fn().mockReturnValue({
            data: [],
            error: null,
          }),
        }),
      };
    }),
    storage: {
      from: jest.fn().mockReturnValue({
        upload: jest.fn().mockResolvedValue({ data: { path: 'test.png' }, error: null }),
        getPublicUrl: jest.fn().mockReturnValue({
          data: { publicUrl: 'https://example.com/test.png' },
        }),
      }),
    },
    channel: jest.fn().mockReturnValue({
      on: jest.fn().mockReturnThis(),
      subscribe: jest.fn().mockImplementation((callback) => {
        callback();
        return { unsubscribe: jest.fn() };
      }),
    }),
    ...customMocks,
  };

  return defaultMocks as unknown as SupabaseClient;
};

export default createMockSupabaseClient;
