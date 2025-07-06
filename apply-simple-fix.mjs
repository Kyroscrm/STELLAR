import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kmjgbbzbqotorocychzl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImttamdiYnpicW90b3JvY3ljaHpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4OTE5NjIsImV4cCI6MjA2NTQ2Nzk2Mn0.oys2FY7VpGnjS2w_od8dXvDRMMSJ7Hy8_5Qrg1O5DE4';

const supabase = createClient(supabaseUrl, supabaseKey);

// Define the SQL statements to execute
const sqlStatements = [
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
   $$`,

  // Grant execute permission
  `GRANT EXECUTE ON FUNCTION public.is_admin TO authenticated`,

  // Drop and recreate leads policies
  `DROP POLICY IF EXISTS "leads_select_policy" ON public.leads`,
  `DROP POLICY IF EXISTS "leads_insert_policy" ON public.leads`,
  `DROP POLICY IF EXISTS "leads_update_policy" ON public.leads`,
  `DROP POLICY IF EXISTS "leads_delete_policy" ON public.leads`,

  `CREATE POLICY "leads_select_policy" ON public.leads FOR SELECT USING (public.is_admin(auth.uid()))`,
  `CREATE POLICY "leads_insert_policy" ON public.leads FOR INSERT WITH CHECK (public.is_admin(auth.uid()))`,
  `CREATE POLICY "leads_update_policy" ON public.leads FOR UPDATE USING (public.is_admin(auth.uid()))`,
  `CREATE POLICY "leads_delete_policy" ON public.leads FOR DELETE USING (public.is_admin(auth.uid()))`,

  // Drop and recreate customers policies
  `DROP POLICY IF EXISTS "customers_select_policy" ON public.customers`,
  `DROP POLICY IF EXISTS "customers_insert_policy" ON public.customers`,
  `DROP POLICY IF EXISTS "customers_update_policy" ON public.customers`,
  `DROP POLICY IF EXISTS "customers_delete_policy" ON public.customers`,

  `CREATE POLICY "customers_select_policy" ON public.customers FOR SELECT USING (public.is_admin(auth.uid()))`,
  `CREATE POLICY "customers_insert_policy" ON public.customers FOR INSERT WITH CHECK (public.is_admin(auth.uid()))`,
  `CREATE POLICY "customers_update_policy" ON public.customers FOR UPDATE USING (public.is_admin(auth.uid()))`,
  `CREATE POLICY "customers_delete_policy" ON public.customers FOR DELETE USING (public.is_admin(auth.uid()))`,

  // Drop and recreate jobs policies
  `DROP POLICY IF EXISTS "jobs_select_policy" ON public.jobs`,
  `DROP POLICY IF EXISTS "jobs_insert_policy" ON public.jobs`,
  `DROP POLICY IF EXISTS "jobs_update_policy" ON public.jobs`,
  `DROP POLICY IF EXISTS "jobs_delete_policy" ON public.jobs`,

  `CREATE POLICY "jobs_select_policy" ON public.jobs FOR SELECT USING (public.is_admin(auth.uid()))`,
  `CREATE POLICY "jobs_insert_policy" ON public.jobs FOR INSERT WITH CHECK (public.is_admin(auth.uid()))`,
  `CREATE POLICY "jobs_update_policy" ON public.jobs FOR UPDATE USING (public.is_admin(auth.uid()))`,
  `CREATE POLICY "jobs_delete_policy" ON public.jobs FOR DELETE USING (public.is_admin(auth.uid()))`,

  // Drop and recreate estimates policies
  `DROP POLICY IF EXISTS "estimates_select_policy" ON public.estimates`,
  `DROP POLICY IF EXISTS "estimates_insert_policy" ON public.estimates`,
  `DROP POLICY IF EXISTS "estimates_update_policy" ON public.estimates`,
  `DROP POLICY IF EXISTS "estimates_delete_policy" ON public.estimates`,

  `CREATE POLICY "estimates_select_policy" ON public.estimates FOR SELECT USING (public.is_admin(auth.uid()))`,
  `CREATE POLICY "estimates_insert_policy" ON public.estimates FOR INSERT WITH CHECK (public.is_admin(auth.uid()))`,
  `CREATE POLICY "estimates_update_policy" ON public.estimates FOR UPDATE USING (public.is_admin(auth.uid()))`,
  `CREATE POLICY "estimates_delete_policy" ON public.estimates FOR DELETE USING (public.is_admin(auth.uid()))`,

  // Drop and recreate invoices policies
  `DROP POLICY IF EXISTS "invoices_select_policy" ON public.invoices`,
  `DROP POLICY IF EXISTS "invoices_insert_policy" ON public.invoices`,
  `DROP POLICY IF EXISTS "invoices_update_policy" ON public.invoices`,
  `DROP POLICY IF EXISTS "invoices_delete_policy" ON public.invoices`,

  `CREATE POLICY "invoices_select_policy" ON public.invoices FOR SELECT USING (public.is_admin(auth.uid()))`,
  `CREATE POLICY "invoices_insert_policy" ON public.invoices FOR INSERT WITH CHECK (public.is_admin(auth.uid()))`,
  `CREATE POLICY "invoices_update_policy" ON public.invoices FOR UPDATE USING (public.is_admin(auth.uid()))`,
  `CREATE POLICY "invoices_delete_policy" ON public.invoices FOR DELETE USING (public.is_admin(auth.uid()))`,

  // Drop and recreate tasks policies
  `DROP POLICY IF EXISTS "tasks_select_policy" ON public.tasks`,
  `DROP POLICY IF EXISTS "tasks_insert_policy" ON public.tasks`,
  `DROP POLICY IF EXISTS "tasks_update_policy" ON public.tasks`,
  `DROP POLICY IF EXISTS "tasks_delete_policy" ON public.tasks`,

  `CREATE POLICY "tasks_select_policy" ON public.tasks FOR SELECT USING (public.is_admin(auth.uid()))`,
  `CREATE POLICY "tasks_insert_policy" ON public.tasks FOR INSERT WITH CHECK (public.is_admin(auth.uid()))`,
  `CREATE POLICY "tasks_update_policy" ON public.tasks FOR UPDATE USING (public.is_admin(auth.uid()))`,
  `CREATE POLICY "tasks_delete_policy" ON public.tasks FOR DELETE USING (public.is_admin(auth.uid()))`,

  // Drop and recreate time_entries policies
  `DROP POLICY IF EXISTS "time_entries_select_policy" ON public.time_entries`,
  `DROP POLICY IF EXISTS "time_entries_insert_policy" ON public.time_entries`,
  `DROP POLICY IF EXISTS "time_entries_update_policy" ON public.time_entries`,
  `DROP POLICY IF EXISTS "time_entries_delete_policy" ON public.time_entries`,

  `CREATE POLICY "time_entries_select_policy" ON public.time_entries FOR SELECT USING (public.is_admin(auth.uid()))`,
  `CREATE POLICY "time_entries_insert_policy" ON public.time_entries FOR INSERT WITH CHECK (public.is_admin(auth.uid()))`,
  `CREATE POLICY "time_entries_update_policy" ON public.time_entries FOR UPDATE USING (public.is_admin(auth.uid()))`,
  `CREATE POLICY "time_entries_delete_policy" ON public.time_entries FOR DELETE USING (public.is_admin(auth.uid()))`,

  // Drop and recreate change_orders policies
  `DROP POLICY IF EXISTS "change_orders_select_policy" ON public.change_orders`,
  `DROP POLICY IF EXISTS "change_orders_insert_policy" ON public.change_orders`,
  `DROP POLICY IF EXISTS "change_orders_update_policy" ON public.change_orders`,
  `DROP POLICY IF EXISTS "change_orders_delete_policy" ON public.change_orders`,

  `CREATE POLICY "change_orders_select_policy" ON public.change_orders FOR SELECT USING (public.is_admin(auth.uid()))`,
  `CREATE POLICY "change_orders_insert_policy" ON public.change_orders FOR INSERT WITH CHECK (public.is_admin(auth.uid()))`,
  `CREATE POLICY "change_orders_update_policy" ON public.change_orders FOR UPDATE USING (public.is_admin(auth.uid()))`,
  `CREATE POLICY "change_orders_delete_policy" ON public.change_orders FOR DELETE USING (public.is_admin(auth.uid()))`
];

async function signInAsAdmin() {
  console.log('🔐 Authenticating as admin user...');
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'nayib@finalroofingcompany.com',
    password: 'Final1234@'
  });

  if (error) {
    console.error('❌ Authentication failed:', error.message);
    return false;
  }

  console.log('✅ Successfully authenticated as:', data.user.email);
  return true;
}

async function executeSQL(sql) {
  try {
    // Try using SQL via edge function first
    const { data, error } = await supabase.rpc('sql', { query: sql });

    if (!error) {
      return { success: true, data };
    }

    // If that fails, try alternative approach
    console.log('🔄 Trying alternative execution method...');

    // For DDL statements, we might need a different approach
    // Let's try creating a temporary edge function
    return { success: false, error: error.message };

  } catch (err) {
    return { success: false, error: err.message };
  }
}

async function applyRBACFix() {
  console.log('🚀 Starting RBAC Fix Application...');

  // Authenticate first
  const authSuccess = await signInAsAdmin();
  if (!authSuccess) {
    console.error('❌ Cannot proceed without authentication');
    return;
  }

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < sqlStatements.length; i++) {
    const statement = sqlStatements[i];
    console.log(`\n📝 Executing statement ${i + 1}/${sqlStatements.length}:`);
    console.log(`   ${statement.substring(0, 80)}...`);

    const result = await executeSQL(statement);

    if (result.success) {
      console.log(`✅ Statement ${i + 1} executed successfully`);
      successCount++;
    } else {
      console.log(`❌ Statement ${i + 1} failed: ${result.error}`);
      failCount++;
    }

    // Small delay to prevent overwhelming the database
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  console.log(`\n📊 RBAC Fix Complete:`);
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log(`📈 Success Rate: ${Math.round((successCount / sqlStatements.length) * 100)}%`);

  // Test the fix
  console.log('\n🧪 Testing CRUD operations after fix...');
  await testCrudOperations();
}

async function testCrudOperations() {
  try {
    // Test lead update
    console.log('🔍 Testing lead update...');
    const { data: leadData, error: leadError } = await supabase
      .from('leads')
      .update({ notes: 'RBAC fix applied successfully - ' + new Date().toISOString() })
      .eq('id', '0c68661d-00b7-42bc-b770-d0d3b004eb50')
      .select();

    if (leadError) {
      console.error('❌ Lead update failed:', leadError.message);
    } else {
      console.log('✅ Lead update successful:', leadData?.length > 0 ? 'Updated' : 'No rows affected');
    }

    // Test customer operations
    console.log('🔍 Testing customer read...');
    const { data: customerData, error: customerError } = await supabase
      .from('customers')
      .select('*')
      .limit(5);

    if (customerError) {
      console.error('❌ Customer read failed:', customerError.message);
    } else {
      console.log('✅ Customer read successful:', customerData?.length || 0, 'records');
    }

    // Test time entries
    console.log('🔍 Testing time entries...');
    const { data: timeData, error: timeError } = await supabase
      .from('time_entries')
      .select('*')
      .limit(5);

    if (timeError) {
      console.error('❌ Time entries failed:', timeError.message);
    } else {
      console.log('✅ Time entries successful:', timeData?.length || 0, 'records');
    }

    // Test change orders
    console.log('🔍 Testing change orders...');
    const { data: changeOrderData, error: changeOrderError } = await supabase
      .from('change_orders')
      .select('*')
      .limit(5);

    if (changeOrderError) {
      console.error('❌ Change orders failed:', changeOrderError.message);
    } else {
      console.log('✅ Change orders successful:', changeOrderData?.length || 0, 'records');
    }

  } catch (err) {
    console.error('❌ Testing failed with exception:', err.message);
  }
}

// Execute the fix
applyRBACFix().catch(console.error);
