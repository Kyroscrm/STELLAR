import { supabase } from '../../../src/integrations/supabase/client';

describe('Health Endpoint Integration', () => {
  it('should return 200 OK with valid response', async () => {
    const response = await fetch(`${process.env.SUPABASE_URL}/functions/v1/health`);
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

  it('should include CORS headers', async () => {
    const response = await fetch(`${process.env.SUPABASE_URL}/functions/v1/health`);

    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
    expect(response.headers.get('Access-Control-Allow-Methods')).toBeDefined();
    expect(response.headers.get('Access-Control-Allow-Headers')).toBeDefined();
  });

  it('should handle OPTIONS request for CORS preflight', async () => {
    const response = await fetch(`${process.env.SUPABASE_URL}/functions/v1/health`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://localhost:3000',
        'Access-Control-Request-Method': 'GET'
      }
    });

    expect(response.status).toBe(204);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
    expect(response.headers.get('Access-Control-Allow-Methods')).toBeDefined();
    expect(response.headers.get('Access-Control-Allow-Headers')).toBeDefined();
  });
});
