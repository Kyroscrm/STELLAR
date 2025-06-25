import { supabase } from '../../../src/integrations/supabase/client';
import { createClient } from '@supabase/supabase-js';

// Mock Deno.env
const mockEnv = {
  get: jest.fn()
};

// Mock Deno.memoryUsage
const mockMemoryUsage = {
  heapTotal: 100 * 1024 * 1024, // 100MB
  heapUsed: 50 * 1024 * 1024,   // 50MB
  rss: 150 * 1024 * 1024        // 150MB
};

// Mock Sentry
jest.mock('@sentry/node', () => ({
  init: jest.fn(),
  captureException: jest.fn()
}));

// Mock Supabase client
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn()
}));

// Mock Deno serve
jest.mock('https://deno.land/std@0.168.0/http/server.ts', () => ({
  serve: (handler) => handler
}));

describe('Health Endpoint', () => {
  let mockSupabase;
  let healthHandler;

  beforeEach(async () => {
    // Reset all mocks
    jest.clearAllMocks();

    // Mock environment variables
    mockEnv.get.mockImplementation((key) => {
      switch (key) {
        case 'SENTRY_DSN_EDGE_FUNCTIONS':
          return 'mock-dsn';
        case 'SUPABASE_URL':
          return 'mock-url';
        case 'SUPABASE_SERVICE_ROLE_KEY':
          return 'mock-key';
        default:
          return undefined;
      }
    });

    // Mock Deno.memoryUsage
    global.Deno = {
      ...global.Deno,
      env: mockEnv,
      memoryUsage: () => mockMemoryUsage
    };

    // Mock Supabase client responses
    mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue({
        data: [{ count: 1 }],
        error: null
      }),
      rpc: jest.fn().mockResolvedValue({
        data: {
          enabled: true,
          retention_period: 7,
          last_backup: new Date().toISOString()
        },
        error: null
      })
    };

    (createClient as jest.Mock).mockReturnValue(mockSupabase);

    // Import and get the handler function
    await import('../../../supabase/functions/health/index.ts');
    healthHandler = jest.requireMock('https://deno.land/std@0.168.0/http/server.ts').serve;
  });

  it('should return 200 OK with correct response shape when all systems are healthy', async () => {
    const response = await healthHandler(new Request('http://localhost/health'));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toMatchObject({
      status: 'ok',
      uptime: expect.any(Number),
      memory: {
        heapTotal: expect.any(Number),
        heapUsed: expect.any(Number),
        rss: expect.any(Number)
      },
      database: {
        connected: true,
        error: null
      },
      pitr: {
        enabled: true,
        retentionPeriod: expect.any(Number),
        lastBackup: expect.any(String),
        error: null
      },
      timestamp: expect.any(String)
    });
  });

  it('should return 503 when database check fails', async () => {
    mockSupabase.limit.mockResolvedValueOnce({
      data: null,
      error: { message: 'Database connection error' }
    });

    const response = await healthHandler(new Request('http://localhost/health'));
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data.database.connected).toBe(false);
    expect(data.database.error).toBe('Database connection error');
  });

  it('should return 503 when PITR check fails', async () => {
    mockSupabase.rpc.mockResolvedValueOnce({
      data: null,
      error: { message: 'PITR check failed' }
    });

    const response = await healthHandler(new Request('http://localhost/health'));
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data.pitr.error).toBe('PITR check failed');
  });

  it('should return 500 on unexpected errors', async () => {
    mockSupabase.limit.mockRejectedValueOnce(new Error('Unexpected error'));

    const response = await healthHandler(new Request('http://localhost/health'));
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({
      status: 'error',
      message: 'Internal server error'
    });
  });
});
