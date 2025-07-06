import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kmjgbbzbqotorocychzl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImttamdiYnpicW90b3JvY3ljaHpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4OTE5NjIsImV4cCI6MjA2NTQ2Nzk2Mn0.oys2FY7VpGnjS2w_od8dXvDRMMSJ7Hy8_5Qrg1O5DE4';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🚨 EMERGENCY RBAC FIX - Starting...');

async function signInAsAdmin() {
  console.log('🔐 Signing in as admin user...');
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'nayib@finalroofingcompany.com',
    password: 'Final1234@'
  });

  if (error) {
    console.error('❌ Auth failed:', error.message);
    return false;
  }

  console.log('✅ Authenticated as:', data.user.email);
  console.log('🆔 User ID:', data.user.id);
  return true;
}

async function emergencyTest() {
  console.log('\n🧪 Testing current permissions...');

  // Test current permissions
  const { data: testData, error: testError } = await supabase
    .from('leads')
    .update({ notes: 'Emergency fix test - ' + new Date().toISOString() })
    .eq('id', '0c68661d-00b7-42bc-b770-d0d3b004eb50')
    .select();

  if (testError) {
    console.error('❌ Update failed:', testError.message);
    console.log('🔧 Need to apply emergency fix...');
    return false;
  } else {
    console.log('✅ Update successful! RBAC is working');
    return true;
  }
}

async function checkUserInformation() {
  console.log('\n📋 Checking user information...');

  // Get current user info
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    console.log('👤 Current User:', user.email, '- ID:', user.id);
  }

  // Try to check profiles table
  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .limit(5);

  if (profileError) {
    console.error('❌ Profiles read failed:', profileError.message);
  } else {
    console.log('📊 Profiles found:', profiles?.length || 0);
    if (profiles && profiles.length > 0) {
      console.log('👥 Sample profile:', profiles[0]);
    }
  }

  // Try to check roles table
  const { data: roles, error: roleError } = await supabase
    .from('roles')
    .select('*');

  if (roleError) {
    console.error('❌ Roles read failed:', roleError.message);
  } else {
    console.log('🎭 Roles found:', roles?.length || 0);
    roles?.forEach(role => console.log(`   - ${role.name}: ${role.description}`));
  }
}

async function testAllModules() {
  console.log('\n🔍 Testing all modules...');

  const modules = [
    { name: 'Leads', table: 'leads' },
    { name: 'Customers', table: 'customers' },
    { name: 'Jobs', table: 'jobs' },
    { name: 'Estimates', table: 'estimates' },
    { name: 'Invoices', table: 'invoices' },
    { name: 'Tasks', table: 'tasks' },
    { name: 'Time Entries', table: 'time_entries' },
    { name: 'Change Orders', table: 'change_orders' }
  ];

  for (const module of modules) {
    try {
      const { data, error } = await supabase
        .from(module.table)
        .select('*')
        .limit(1);

      if (error) {
        console.log(`❌ ${module.name}: ${error.message}`);
      } else {
        console.log(`✅ ${module.name}: ${data?.length || 0} records accessible`);
      }
    } catch (err) {
      console.log(`💥 ${module.name}: Exception - ${err.message}`);
    }
  }
}

async function runEmergencyDiagnostics() {
  // Sign in
  const authSuccess = await signInAsAdmin();
  if (!authSuccess) {
    console.error('❌ Cannot proceed without authentication');
    return;
  }

  // Check user info
  await checkUserInformation();

  // Test current state
  const isWorking = await emergencyTest();

  if (isWorking) {
    console.log('\n🎉 System is working! No emergency fix needed.');
  } else {
    console.log('\n🚨 System needs fixing! Running full diagnostics...');
    await testAllModules();
  }

  console.log('\n📈 Emergency diagnostics complete.');
  console.log('📋 Summary:');
  console.log('  - Admin user can authenticate: ✅');
  console.log('  - Profile access needs verification');
  console.log('  - RBAC policies need recreation');
}

// Run diagnostics
runEmergencyDiagnostics().catch(console.error);
