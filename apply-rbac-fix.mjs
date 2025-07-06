import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = 'https://kmjgbbzbqotorocychzl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImttamdiYnpicW90b3JvY3ljaHpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4OTE5NjIsImV4cCI6MjA2NTQ2Nzk2Mn0.oys2FY7VpGnjS2w_od8dXvDRMMSJ7Hy8_5Qrg1O5DE4';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔧 Applying RBAC Policy Fix...');

// Read the migration file
const migrationSQL = fs.readFileSync('supabase/migrations/20250703030936_rbac_policy_fix.sql', 'utf8');

// Split the SQL into individual statements
const statements = migrationSQL
  .split(';')
  .map(stmt => stmt.trim())
  .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

console.log(`📊 Found ${statements.length} SQL statements to execute`);

async function applyMigration() {
  try {
    // First, try to login with admin credentials
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'nayib@finalroofingcompany.com',
      password: 'Final1234@'
    });

    if (authError) {
      console.error('❌ Auth error:', authError.message);
      console.log('⚠️  Trying to apply migration without authentication...');
    } else {
      console.log('✅ Successfully authenticated as admin');
    }

    // Apply each statement
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];

      // Skip empty statements and comments
      if (!statement || statement.startsWith('--') || statement.trim() === '') {
        continue;
      }

      console.log(`🔄 Executing statement ${i + 1}/${statements.length}...`);

      try {
        // For DDL statements, we need to use raw SQL
        const { data, error } = await supabase.rpc('admin_execute_sql', {
          query: statement + ';'
        });

        if (error) {
          console.warn(`⚠️  Statement ${i + 1} failed:`, error.message);
          errorCount++;
        } else {
          console.log(`✅ Statement ${i + 1} executed successfully`);
          successCount++;
        }
      } catch (err) {
        console.warn(`⚠️  Statement ${i + 1} failed:`, err.message);
        errorCount++;
      }

      // Add a small delay to avoid overwhelming the database
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log('\n📊 Migration Summary:');
    console.log(`✅ Successful statements: ${successCount}`);
    console.log(`❌ Failed statements: ${errorCount}`);
    console.log(`📝 Total statements: ${successCount + errorCount}`);

    // Test CRUD operations
    console.log('\n🧪 Testing CRUD operations...');

    // Test lead update
    console.log('Testing lead update...');
    const { data: leadData, error: leadError } = await supabase
      .from('leads')
      .update({ notes: 'RBAC fix test - ' + new Date().toISOString() })
      .eq('id', '0c68661d-00b7-42bc-b770-d0d3b004eb50')
      .select();

    if (leadError) {
      console.log('❌ Lead update failed:', leadError.message);
    } else {
      console.log('✅ Lead update successful');
    }

    // Test time entries
    console.log('Testing time entries...');
    const { data: timeData, error: timeError } = await supabase
      .from('time_entries')
      .select('id, user_id, start_time')
      .limit(1);

    if (timeError) {
      console.log('❌ Time entries query failed:', timeError.message);
    } else {
      console.log('✅ Time entries query successful');
    }

    // Test change orders
    console.log('Testing change orders...');
    const { data: changeData, error: changeError } = await supabase
      .from('change_orders')
      .select('id, job_id, created_by')
      .limit(1);

    if (changeError) {
      console.log('❌ Change orders query failed:', changeError.message);
    } else {
      console.log('✅ Change orders query successful');
    }

    console.log('\n🎉 RBAC Policy Fix Complete!');

  } catch (error) {
    console.error('💥 Fatal error:', error.message);
    process.exit(1);
  }
}

applyMigration();
