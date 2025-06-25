import * as Sentry from '@sentry/node';
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from '@supabase/supabase-js';

// Initialize Sentry
Sentry.init({
  dsn: Deno.env.get('SENTRY_DSN_EDGE_FUNCTIONS'),
  tracesSampleRate: 0.2,
});

const startTime = Date.now();

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  try {
    // Basic health metrics
    const uptime = Math.floor((Date.now() - startTime) / 1000); // in seconds
    const memoryUsage = Deno.memoryUsage();

    // Check database connectivity
    const { data: dbCheck, error: dbError } = await supabase
      .from('health_checks')
      .select('count')
      .limit(1);

    // Check PITR status
    const { data: pitrStatus, error: pitrError } = await supabase
      .rpc('get_pitr_status');

    // Return health status
    return new Response(
      JSON.stringify({
        status: 'ok',
        uptime,
        memory: {
          heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
          heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
          rss: Math.round(memoryUsage.rss / 1024 / 1024), // MB
        },
        database: {
          connected: !dbError,
          error: dbError ? dbError.message : null,
        },
        pitr: {
          enabled: pitrStatus?.enabled || false,
          retentionPeriod: pitrStatus?.retention_period || 0,
          lastBackup: pitrStatus?.last_backup || null,
          error: pitrError ? pitrError.message : null,
        },
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: dbError || pitrError ? 503 : 200,
      },
    );
  } catch (error) {
    // Report error to Sentry
    Sentry.captureException(error);

    return new Response(
      JSON.stringify({
        status: 'error',
        message: 'Internal server error',
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 500,
      },
    );
  }
});
