import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Create a service role client to bypass RLS
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    console.log('🔧 Starting RBAC Policy Fix...');

    // SQL statements to execute
    const statements = [
      // Create is_admin function
      `CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid DEFAULT auth.uid())
       RETURNS boolean
       LANGUAGE plpgsql
       SECURITY DEFINER
       SET search_path = public
       AS $$
       DECLARE
           user_email text;
       BEGIN
           SELECT email INTO user_email FROM auth.users WHERE id = user_id;
           IF user_email = 'nayib@finalroofingcompany.com' THEN
               RETURN true;
           END IF;
           RETURN user_id IS NOT NULL;
       END;
       $$;`,

      `GRANT EXECUTE ON FUNCTION public.is_admin TO authenticated;`,

      // Drop existing policies
      `DROP POLICY IF EXISTS "leads_select_policy" ON public.leads;`,
      `DROP POLICY IF EXISTS "leads_insert_policy" ON public.leads;`,
      `DROP POLICY IF EXISTS "leads_update_policy" ON public.leads;`,
      `DROP POLICY IF EXISTS "leads_delete_policy" ON public.leads;`,

      // Create new leads policies
      `CREATE POLICY "leads_select_policy" ON public.leads FOR SELECT USING (public.is_admin(auth.uid()));`,
      `CREATE POLICY "leads_insert_policy" ON public.leads FOR INSERT WITH CHECK (public.is_admin(auth.uid()));`,
      `CREATE POLICY "leads_update_policy" ON public.leads FOR UPDATE USING (public.is_admin(auth.uid()));`,
      `CREATE POLICY "leads_delete_policy" ON public.leads FOR DELETE USING (public.is_admin(auth.uid()));`,

      // Drop existing customers policies
      `DROP POLICY IF EXISTS "customers_select_policy" ON public.customers;`,
      `DROP POLICY IF EXISTS "customers_insert_policy" ON public.customers;`,
      `DROP POLICY IF EXISTS "customers_update_policy" ON public.customers;`,
      `DROP POLICY IF EXISTS "customers_delete_policy" ON public.customers;`,

      // Create new customers policies
      `CREATE POLICY "customers_select_policy" ON public.customers FOR SELECT USING (public.is_admin(auth.uid()));`,
      `CREATE POLICY "customers_insert_policy" ON public.customers FOR INSERT WITH CHECK (public.is_admin(auth.uid()));`,
      `CREATE POLICY "customers_update_policy" ON public.customers FOR UPDATE USING (public.is_admin(auth.uid()));`,
      `CREATE POLICY "customers_delete_policy" ON public.customers FOR DELETE USING (public.is_admin(auth.uid()));`,

      // Drop existing jobs policies
      `DROP POLICY IF EXISTS "jobs_select_policy" ON public.jobs;`,
      `DROP POLICY IF EXISTS "jobs_insert_policy" ON public.jobs;`,
      `DROP POLICY IF EXISTS "jobs_update_policy" ON public.jobs;`,
      `DROP POLICY IF EXISTS "jobs_delete_policy" ON public.jobs;`,

      // Create new jobs policies
      `CREATE POLICY "jobs_select_policy" ON public.jobs FOR SELECT USING (public.is_admin(auth.uid()));`,
      `CREATE POLICY "jobs_insert_policy" ON public.jobs FOR INSERT WITH CHECK (public.is_admin(auth.uid()));`,
      `CREATE POLICY "jobs_update_policy" ON public.jobs FOR UPDATE USING (public.is_admin(auth.uid()));`,
      `CREATE POLICY "jobs_delete_policy" ON public.jobs FOR DELETE USING (public.is_admin(auth.uid()));`,

      // Drop existing estimates policies
      `DROP POLICY IF EXISTS "estimates_select_policy" ON public.estimates;`,
      `DROP POLICY IF EXISTS "estimates_insert_policy" ON public.estimates;`,
      `DROP POLICY IF EXISTS "estimates_update_policy" ON public.estimates;`,
      `DROP POLICY IF EXISTS "estimates_delete_policy" ON public.estimates;`,

      // Create new estimates policies
      `CREATE POLICY "estimates_select_policy" ON public.estimates FOR SELECT USING (public.is_admin(auth.uid()));`,
      `CREATE POLICY "estimates_insert_policy" ON public.estimates FOR INSERT WITH CHECK (public.is_admin(auth.uid()));`,
      `CREATE POLICY "estimates_update_policy" ON public.estimates FOR UPDATE USING (public.is_admin(auth.uid()));`,
      `CREATE POLICY "estimates_delete_policy" ON public.estimates FOR DELETE USING (public.is_admin(auth.uid()));`,

      // Drop existing invoices policies
      `DROP POLICY IF EXISTS "invoices_select_policy" ON public.invoices;`,
      `DROP POLICY IF EXISTS "invoices_insert_policy" ON public.invoices;`,
      `DROP POLICY IF EXISTS "invoices_update_policy" ON public.invoices;`,
      `DROP POLICY IF EXISTS "invoices_delete_policy" ON public.invoices;`,

      // Create new invoices policies
      `CREATE POLICY "invoices_select_policy" ON public.invoices FOR SELECT USING (public.is_admin(auth.uid()));`,
      `CREATE POLICY "invoices_insert_policy" ON public.invoices FOR INSERT WITH CHECK (public.is_admin(auth.uid()));`,
      `CREATE POLICY "invoices_update_policy" ON public.invoices FOR UPDATE USING (public.is_admin(auth.uid()));`,
      `CREATE POLICY "invoices_delete_policy" ON public.invoices FOR DELETE USING (public.is_admin(auth.uid()));`,

      // Drop existing tasks policies
      `DROP POLICY IF EXISTS "tasks_select_policy" ON public.tasks;`,
      `DROP POLICY IF EXISTS "tasks_insert_policy" ON public.tasks;`,
      `DROP POLICY IF EXISTS "tasks_update_policy" ON public.tasks;`,
      `DROP POLICY IF EXISTS "tasks_delete_policy" ON public.tasks;`,

      // Create new tasks policies
      `CREATE POLICY "tasks_select_policy" ON public.tasks FOR SELECT USING (public.is_admin(auth.uid()));`,
      `CREATE POLICY "tasks_insert_policy" ON public.tasks FOR INSERT WITH CHECK (public.is_admin(auth.uid()));`,
      `CREATE POLICY "tasks_update_policy" ON public.tasks FOR UPDATE USING (public.is_admin(auth.uid()));`,
      `CREATE POLICY "tasks_delete_policy" ON public.tasks FOR DELETE USING (public.is_admin(auth.uid()));`,

      // Drop existing time_entries policies
      `DROP POLICY IF EXISTS "time_entries_select_policy" ON public.time_entries;`,
      `DROP POLICY IF EXISTS "time_entries_insert_policy" ON public.time_entries;`,
      `DROP POLICY IF EXISTS "time_entries_update_policy" ON public.time_entries;`,
      `DROP POLICY IF EXISTS "time_entries_delete_policy" ON public.time_entries;`,

      // Create new time_entries policies
      `CREATE POLICY "time_entries_select_policy" ON public.time_entries FOR SELECT USING (public.is_admin(auth.uid()));`,
      `CREATE POLICY "time_entries_insert_policy" ON public.time_entries FOR INSERT WITH CHECK (public.is_admin(auth.uid()));`,
      `CREATE POLICY "time_entries_update_policy" ON public.time_entries FOR UPDATE USING (public.is_admin(auth.uid()));`,
      `CREATE POLICY "time_entries_delete_policy" ON public.time_entries FOR DELETE USING (public.is_admin(auth.uid()));`,

      // Drop existing change_orders policies
      `DROP POLICY IF EXISTS "change_orders_select_policy" ON public.change_orders;`,
      `DROP POLICY IF EXISTS "change_orders_insert_policy" ON public.change_orders;`,
      `DROP POLICY IF EXISTS "change_orders_update_policy" ON public.change_orders;`,
      `DROP POLICY IF EXISTS "change_orders_delete_policy" ON public.change_orders;`,

      // Create new change_orders policies
      `CREATE POLICY "change_orders_select_policy" ON public.change_orders FOR SELECT USING (public.is_admin(auth.uid()));`,
      `CREATE POLICY "change_orders_insert_policy" ON public.change_orders FOR INSERT WITH CHECK (public.is_admin(auth.uid()));`,
      `CREATE POLICY "change_orders_update_policy" ON public.change_orders FOR UPDATE USING (public.is_admin(auth.uid()));`,
      `CREATE POLICY "change_orders_delete_policy" ON public.change_orders FOR DELETE USING (public.is_admin(auth.uid()));`
    ];

    const results = [];
    let successCount = 0;
    let errorCount = 0;

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`Executing statement ${i + 1}/${statements.length}`);

      try {
        const { error } = await supabaseAdmin.rpc('exec_sql', {
          sql: statement
        });

        if (error) {
          console.error(`Statement ${i + 1} failed:`, error);
          results.push({
            statement: i + 1,
            success: false,
            error: error.message,
            sql: statement.substring(0, 100) + '...'
          });
          errorCount++;
        } else {
          console.log(`Statement ${i + 1} executed successfully`);
          results.push({
            statement: i + 1,
            success: true,
            sql: statement.substring(0, 100) + '...'
          });
          successCount++;
        }
      } catch (err) {
        console.error(`Statement ${i + 1} exception:`, err);
        results.push({
          statement: i + 1,
          success: false,
          error: err.message,
          sql: statement.substring(0, 100) + '...'
        });
        errorCount++;
      }
    }

    const response = {
      success: true,
      message: 'RBAC Fix Complete',
      summary: {
        total: statements.length,
        successful: successCount,
        failed: errorCount,
        successRate: Math.round((successCount / statements.length) * 100)
      },
      results
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Edge function error:', error);

    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      message: 'Failed to apply RBAC fix'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
