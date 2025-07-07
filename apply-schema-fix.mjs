import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = 'https://kmjgbbzbqotorocychzl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImttamdiYnpicW90b3JvY3ljaHpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4OTE5NjIsImV4cCI6MjA2NTQ2Nzk2Mn0.oys2FY7VpGnjS2w_od8dXvDRMMSJ7Hy8_5Qrg1O5DE4';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔧 SCHEMA MISMATCH FIX - Starting...');

// Critical schema fix statements
const schemaFixStatements = [
  // Add status column to time_entries
  "ALTER TABLE public.time_entries ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active'",

  // Update existing time entries with status
  `UPDATE public.time_entries
   SET status = CASE
     WHEN end_time IS NULL THEN 'active'
     ELSE 'completed'
   END
   WHERE status IS NULL`,

  // Add amount column to change_orders
  "ALTER TABLE public.change_orders ADD COLUMN IF NOT EXISTS amount DECIMAL(10,2) DEFAULT 0.00",

  // Update existing change orders with amount
  "UPDATE public.change_orders SET amount = 0.00 WHERE amount IS NULL",

  // Add estimate_number column to estimates
  "ALTER TABLE public.estimates ADD COLUMN IF NOT EXISTS estimate_number VARCHAR(50)",

  // Add title column to invoices
  "ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS title VARCHAR(255)",

  // Add created_by column to tasks
  "ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS created_by UUID",

  // Update existing records with defaults
  "UPDATE public.estimates SET estimate_number = 'EST-' || LPAD(ROW_NUMBER() OVER (ORDER BY created_at)::TEXT, 4, '0') WHERE estimate_number IS NULL",

  "UPDATE public.invoices SET title = 'Invoice ' || COALESCE(invoice_number, 'New') WHERE title IS NULL",

  "UPDATE public.tasks SET created_by = '28dc0c62-8e09-44e3-9497-5f62c6a0b436' WHERE created_by IS NULL"
];

async function signInAsAdmin() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'nayib@finalroofingcompany.com',
    password: 'Final1234@'
  });

  if (error) {
    console.error('❌ Auth failed:', error.message);
    return false;
  }

  console.log('✅ Authenticated as:', data.user.email);
  return true;
}

async function executeSchemaFix() {
  console.log('🚀 Applying schema fixes...');

  const authSuccess = await signInAsAdmin();
  if (!authSuccess) {
    console.error('❌ Cannot proceed without authentication');
    return;
  }

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < schemaFixStatements.length; i++) {
    const statement = schemaFixStatements[i];
    console.log(`\n📝 Executing fix ${i + 1}/${schemaFixStatements.length}:`);
    console.log(`   ${statement.substring(0, 80)}...`);

    try {
      // Using raw SQL through direct connection
      // This bypasses RLS and schema cache issues
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/execute_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
          'apikey': supabaseKey
        },
        body: JSON.stringify({ sql: statement })
      });

      if (response.ok) {
        console.log(`✅ Fix ${i + 1} applied successfully`);
        successCount++;
      } else {
        const errorText = await response.text();
        console.log(`❌ Fix ${i + 1} failed: ${errorText}`);
        errorCount++;
      }
    } catch (err) {
      console.log(`💥 Fix ${i + 1} exception: ${err.message}`);
      errorCount++;
    }

    // Small delay
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log(`\n📊 Schema Fix Summary:`);
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${errorCount}`);
  console.log(`📈 Success Rate: ${Math.round((successCount / schemaFixStatements.length) * 100)}%`);

  // Test the fixes
  console.log('\n🧪 Testing fixes...');
  await testSchemaFixes();
}

async function testSchemaFixes() {
  try {
    // Test time entry with status
    console.log('⏰ Testing time entry with status...');
    const { data: timeEntry, error: timeError } = await supabase
      .from('time_entries')
      .insert([{
        user_id: '28dc0c62-8e09-44e3-9497-5f62c6a0b436',
        start_time: new Date().toISOString(),
        status: 'active',
        description: 'Schema fix test'
      }])
      .select();

    if (timeError) {
      console.log(`❌ Time entry test failed: ${timeError.message}`);
    } else {
      console.log(`✅ Time entry test successful`);
      // Clean up
      if (timeEntry && timeEntry.length > 0) {
        await supabase.from('time_entries').delete().eq('id', timeEntry[0].id);
      }
    }

    // Test change order with amount
    console.log('📋 Testing change order with amount...');

    // First get a job
    const { data: jobs } = await supabase.from('jobs').select('id').limit(1);
    if (jobs && jobs.length > 0) {
      const { data: changeOrder, error: changeError } = await supabase
        .from('change_orders')
        .insert([{
          job_id: jobs[0].id,
          title: 'Schema Fix Test',
          description: 'Testing change order with amount',
          amount: 500.00,
          status: 'pending',
          created_by: '28dc0c62-8e09-44e3-9497-5f62c6a0b436'
        }])
        .select();

      if (changeError) {
        console.log(`❌ Change order test failed: ${changeError.message}`);
      } else {
        console.log(`✅ Change order test successful`);
        // Clean up
        if (changeOrder && changeOrder.length > 0) {
          await supabase.from('change_orders').delete().eq('id', changeOrder[0].id);
        }
      }
    }

    // Test estimate with estimate_number
    console.log('💰 Testing estimate with estimate_number...');
    const { data: estimate, error: estimateError } = await supabase
      .from('estimates')
      .insert([{
        user_id: '28dc0c62-8e09-44e3-9497-5f62c6a0b436',
        title: 'Schema Fix Test Estimate',
        total_amount: 1000.00,
        status: 'draft'
      }])
      .select();

    if (estimateError) {
      console.log(`❌ Estimate test failed: ${estimateError.message}`);
    } else {
      console.log(`✅ Estimate test successful - Number: ${estimate[0]?.estimate_number}`);
      // Clean up
      if (estimate && estimate.length > 0) {
        await supabase.from('estimates').delete().eq('id', estimate[0].id);
      }
    }

    // Test invoice with title
    console.log('🧾 Testing invoice with title...');
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert([{
        user_id: '28dc0c62-8e09-44e3-9497-5f62c6a0b436',
        invoice_number: 'TEST-FIX-001',
        total_amount: 1500.00,
        status: 'draft'
      }])
      .select();

    if (invoiceError) {
      console.log(`❌ Invoice test failed: ${invoiceError.message}`);
    } else {
      console.log(`✅ Invoice test successful - Title: ${invoice[0]?.title}`);
      // Clean up
      if (invoice && invoice.length > 0) {
        await supabase.from('invoices').delete().eq('id', invoice[0].id);
      }
    }

    // Test task with created_by
    console.log('📋 Testing task with created_by...');
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .insert([{
        title: 'Schema Fix Test Task',
        description: 'Testing task with created_by',
        status: 'pending',
        priority: 'medium',
        assigned_to: '28dc0c62-8e09-44e3-9497-5f62c6a0b436',
        created_by: '28dc0c62-8e09-44e3-9497-5f62c6a0b436'
      }])
      .select();

    if (taskError) {
      console.log(`❌ Task test failed: ${taskError.message}`);
    } else {
      console.log(`✅ Task test successful`);
      // Clean up
      if (task && task.length > 0) {
        await supabase.from('tasks').delete().eq('id', task[0].id);
      }
    }

  } catch (err) {
    console.error('❌ Testing failed with exception:', err.message);
  }
}

// Execute the schema fix
executeSchemaFix().catch(console.error);
