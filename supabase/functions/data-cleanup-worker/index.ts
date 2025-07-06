import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

interface RetentionPolicy {
  id: string;
  table_name: string;
  retention_period_days: number;
  policy_type: 'automatic' | 'manual' | 'legal_hold';
  auto_delete: boolean;
}

interface CleanupResult {
  table_name: string;
  records_deleted: number;
  cleanup_date: string;
  error?: string;
}

serve(async (req) => {
  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get all automatic retention policies
    const { data: policies, error: policiesError } = await supabaseClient
      .from('data_retention_policies')
      .select('*')
      .eq('auto_delete', true)
      .eq('policy_type', 'automatic');

    if (policiesError) {
      throw new Error(`Failed to fetch retention policies: ${policiesError.message}`);
    }

    const results: CleanupResult[] = [];

    // Process each policy
    for (const policy of policies) {
      try {
        // Call the cleanup function for each table
        const { data: result, error: cleanupError } = await supabaseClient
          .rpc('cleanup_expired_data', { table_name: policy.table_name });

        if (cleanupError) {
          results.push({
            table_name: policy.table_name,
            records_deleted: 0,
            cleanup_date: new Date().toISOString(),
            error: cleanupError.message
          });
          continue;
        }

        results.push(result as CleanupResult);

        // Log the cleanup activity
        await supabaseClient
          .from('activity_logs')
          .insert({
            action: 'cleanup',
            entity_type: 'data_retention',
            entity_id: policy.table_name,
            description: `Cleaned up ${result.records_deleted} records from ${policy.table_name}`,
            metadata: {
              records_deleted: result.records_deleted,
              cleanup_date: result.cleanup_date,
              policy_id: policy.id
            }
          });
      } catch (err) {
        results.push({
          table_name: policy.table_name,
          records_deleted: 0,
          cleanup_date: new Date().toISOString(),
          error: err.message
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        results
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        success: false,
        error: err.message
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
