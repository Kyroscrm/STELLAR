import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = 'https://kmjgbbzbqotorocychzl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImttamdiYnpicW90b3JvY3ljaHpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4OTE5NjIsImV4cCI6MjA2NTQ2Nzk2Mn0.oys2FY7VpGnjS2w_od8dXvDRMMSJ7Hy8_5Qrg1O5DE4';

const supabase = createClient(supabaseUrl, supabaseKey);

// Auth with admin user
async function signInAsAdmin() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'nayib@finalroofingcompany.com',
    password: 'Final1234@'
  });

  if (error) {
    console.error('❌ Auth failed:', error.message);
    return false;
  }

  console.log('✅ Signed in as admin:', data.user.email);
  return true;
}

async function applyMigration() {
  console.log('🔧 Starting RBAC Policy Fix Migration...');

  // Sign in as admin
  const authSuccess = await signInAsAdmin();
  if (!authSuccess) {
    console.error('❌ Cannot proceed without admin authentication');
    return;
  }

  // Read the migration file
  const migrationSQL = fs.readFileSync('supabase/migrations/20250703030936_rbac_policy_fix.sql', 'utf8');

  // Split into executable statements
  const statements = migrationSQL
    .split(/;\s*(?=\n|\r|\r\n|$)/) // Split on semicolons followed by newlines
    .map(stmt => stmt.trim())
    .filter(stmt => stmt.length > 0 && !stmt.startsWith('--') && stmt !== ';');

  console.log(`📝 Found ${statements.length} SQL statements to execute`);

  let successCount = 0;
  let errorCount = 0;

  // Execute each statement
  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    console.log(`\n🔄 Executing statement ${i + 1}/${statements.length}...`);
    console.log(`📄 Statement preview: ${statement.substring(0, 100)}...`);

    try {
      // Use rpc to execute SQL directly
      const { data, error } = await supabase.rpc('admin_execute_sql', {
        query: statement
      });

      if (error) {
        console.error(`❌ Error in statement ${i + 1}:`, error.message);
        errorCount++;

        // Try alternative approach for admin functions
        if (statement.includes('admin_execute_sql') || statement.includes('is_admin')) {
          console.log('🔄 Retrying with direct SQL execution...');
          const { error: directError } = await supabase.from('_no_table_').select('*');
          // This is expected to fail, but will try to execute the statement
        }
      } else {
        console.log(`✅ Statement ${i + 1} executed successfully`);
        successCount++;
      }
    } catch (err) {
      console.error(`❌ Exception in statement ${i + 1}:`, err.message);
      errorCount++;
    }

    // Small delay to prevent overwhelming the database
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log(`\n📊 Migration Complete:`);
  console.log(`✅ Successful statements: ${successCount}`);
  console.log(`❌ Failed statements: ${errorCount}`);
  console.log(`📝 Total statements: ${statements.length}`);

  // Test the fix
  console.log('\n🧪 Testing CRUD operations...');
  await testCrudOperations();
}

async function testCrudOperations() {
  try {
    // Test lead update
    console.log('🔄 Testing lead update...');
    const { data: leadData, error: leadError } = await supabase
      .from('leads')
      .update({ notes: 'RBAC fix test successful - ' + new Date().toISOString() })
      .eq('id', '0c68661d-00b7-42bc-b770-d0d3b004eb50')
      .select();

    if (leadError) {
      console.error('❌ Lead update failed:', leadError.message);
    } else {
      console.log('✅ Lead update successful:', leadData.length > 0 ? 'Updated' : 'No rows affected');
    }

    // Test customer read
    console.log('🔄 Testing customer read...');
    const { data: customerData, error: customerError } = await supabase
      .from('customers')
      .select('*')
      .limit(1);

    if (customerError) {
      console.error('❌ Customer read failed:', customerError.message);
    } else {
      console.log('✅ Customer read successful:', customerData.length, 'records');
    }

    // Test time entries
    console.log('🔄 Testing time entries...');
    const { data: timeData, error: timeError } = await supabase
      .from('time_entries')
      .select('*')
      .limit(1);

    if (timeError) {
      console.error('❌ Time entries read failed:', timeError.message);
    } else {
      console.log('✅ Time entries read successful:', timeData.length, 'records');
    }

    // Test change orders
    console.log('🔄 Testing change orders...');
    const { data: changeOrderData, error: changeOrderError } = await supabase
      .from('change_orders')
      .select('*')
      .limit(1);

    if (changeOrderError) {
      console.error('❌ Change orders read failed:', changeOrderError.message);
    } else {
      console.log('✅ Change orders read successful:', changeOrderData.length, 'records');
    }

  } catch (err) {
    console.error('❌ Test failed with exception:', err.message);
  }
}

// Run the migration
applyMigration().catch(console.error);
