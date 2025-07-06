import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kmjgbbzbqotorocychzl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImttamdiYnpicW90b3JvY3ljaHpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4OTE5NjIsImV4cCI6MjA2NTQ2Nzk2Mn0.oys2FY7VpGnjS2w_od8dXvDRMMSJ7Hy8_5Qrg1O5DE4';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔬 COMPREHENSIVE CRUD TEST - Starting...');

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

async function testCRUD(moduleName, tableName, sampleData = {}) {
  console.log(`\n📋 Testing ${moduleName} (${tableName})...`);

  const results = {
    read: false,
    insert: false,
    update: false,
    delete: false
  };

  // Test READ
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(3);

    if (error) {
      console.log(`❌ READ failed: ${error.message}`);
    } else {
      console.log(`✅ READ successful: ${data?.length || 0} records`);
      results.read = true;
    }
  } catch (err) {
    console.log(`💥 READ exception: ${err.message}`);
  }

  // Test INSERT (if sample data provided)
  if (Object.keys(sampleData).length > 0) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .insert([sampleData])
        .select();

      if (error) {
        console.log(`❌ INSERT failed: ${error.message}`);
      } else {
        console.log(`✅ INSERT successful: Created record`);
        results.insert = true;

        // Test UPDATE with the inserted record
        if (data && data.length > 0) {
          const insertedId = data[0].id;

          try {
            const { data: updateData, error: updateError } = await supabase
              .from(tableName)
              .update({ updated_at: new Date().toISOString() })
              .eq('id', insertedId)
              .select();

            if (updateError) {
              console.log(`❌ UPDATE failed: ${updateError.message}`);
            } else {
              console.log(`✅ UPDATE successful: Modified record`);
              results.update = true;
            }
          } catch (err) {
            console.log(`💥 UPDATE exception: ${err.message}`);
          }

          // Test DELETE with the inserted record
          try {
            const { error: deleteError } = await supabase
              .from(tableName)
              .delete()
              .eq('id', insertedId);

            if (deleteError) {
              console.log(`❌ DELETE failed: ${deleteError.message}`);
            } else {
              console.log(`✅ DELETE successful: Removed test record`);
              results.delete = true;
            }
          } catch (err) {
            console.log(`💥 DELETE exception: ${err.message}`);
          }
        }
      }
    } catch (err) {
      console.log(`💥 INSERT exception: ${err.message}`);
    }
  }

  return results;
}

async function testTimeTrackingSpecifically() {
  console.log(`\n⏰ SPECIFIC TIME TRACKING TEST...`);

  // Test current time entries
  const { data: currentEntries, error: currentError } = await supabase
    .from('time_entries')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  if (currentError) {
    console.log(`❌ Time entries read failed: ${currentError.message}`);
    return;
  }

  console.log(`📊 Found ${currentEntries?.length || 0} time entries`);
  if (currentEntries && currentEntries.length > 0) {
    console.log(`🕐 Latest entry:`, {
      id: currentEntries[0].id,
      status: currentEntries[0].status,
      start_time: currentEntries[0].start_time,
      end_time: currentEntries[0].end_time
    });
  }

  // Test creating a new time entry
  const testEntry = {
    user_id: '28dc0c62-8e09-44e3-9497-5f62c6a0b436',
    start_time: new Date().toISOString(),
    status: 'active',
    description: 'RBAC test entry',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const { data: newEntry, error: insertError } = await supabase
    .from('time_entries')
    .insert([testEntry])
    .select();

  if (insertError) {
    console.log(`❌ Time entry creation failed: ${insertError.message}`);
  } else {
    console.log(`✅ Time entry created successfully`);

    // Test ending the time entry
    const entryId = newEntry[0].id;
    const { data: endedEntry, error: endError } = await supabase
      .from('time_entries')
      .update({
        end_time: new Date().toISOString(),
        status: 'completed'
      })
      .eq('id', entryId)
      .select();

    if (endError) {
      console.log(`❌ Time entry update failed: ${endError.message}`);
    } else {
      console.log(`✅ Time entry ended successfully`);
    }

    // Clean up test entry
    await supabase.from('time_entries').delete().eq('id', entryId);
  }
}

async function testChangeOrdersSpecifically() {
  console.log(`\n📋 SPECIFIC CHANGE ORDERS TEST...`);

  // First, get a job to link to
  const { data: jobs, error: jobError } = await supabase
    .from('jobs')
    .select('id, title')
    .limit(1);

  if (jobError || !jobs || jobs.length === 0) {
    console.log(`❌ No jobs found for change order test: ${jobError?.message || 'No jobs'}`);
    return;
  }

  const jobId = jobs[0].id;
  console.log(`🔗 Using job: ${jobs[0].title} (${jobId})`);

  // Test creating a change order
  const testChangeOrder = {
    job_id: jobId,
    title: 'Test Change Order - RBAC',
    description: 'Testing change order creation through RBAC fix',
    amount: 500.00,
    status: 'pending',
    created_by: '28dc0c62-8e09-44e3-9497-5f62c6a0b436',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const { data: newOrder, error: insertError } = await supabase
    .from('change_orders')
    .insert([testChangeOrder])
    .select();

  if (insertError) {
    console.log(`❌ Change order creation failed: ${insertError.message}`);
  } else {
    console.log(`✅ Change order created successfully`);

    // Test updating the change order
    const orderId = newOrder[0].id;
    const { data: updatedOrder, error: updateError } = await supabase
      .from('change_orders')
      .update({
        status: 'approved',
        amount: 750.00
      })
      .eq('id', orderId)
      .select();

    if (updateError) {
      console.log(`❌ Change order update failed: ${updateError.message}`);
    } else {
      console.log(`✅ Change order updated successfully`);
    }

    // Clean up test change order
    await supabase.from('change_orders').delete().eq('id', orderId);
  }
}

async function runComprehensiveTest() {
  // Authenticate
  const authSuccess = await signInAsAdmin();
  if (!authSuccess) {
    console.error('❌ Cannot proceed without authentication');
    return;
  }

  const modules = [
    {
      name: 'Leads',
      table: 'leads',
      sample: {
        user_id: '28dc0c62-8e09-44e3-9497-5f62c6a0b436',
        first_name: 'Test',
        last_name: 'Lead',
        email: 'test@rbacfix.com',
        phone: '555-0123',
        status: 'new',
        source: 'website'
      }
    },
    {
      name: 'Customers',
      table: 'customers',
      sample: {
        user_id: '28dc0c62-8e09-44e3-9497-5f62c6a0b436',
        first_name: 'Test',
        last_name: 'Customer',
        email: 'customer@rbacfix.com',
        phone: '555-0124'
      }
    },
    {
      name: 'Jobs',
      table: 'jobs',
      sample: {
        user_id: '28dc0c62-8e09-44e3-9497-5f62c6a0b436',
        title: 'Test Job - RBAC',
        description: 'Testing job creation',
        status: 'scheduled'
      }
    },
    {
      name: 'Estimates',
      table: 'estimates',
      sample: {
        user_id: '28dc0c62-8e09-44e3-9497-5f62c6a0b436',
        title: 'Test Estimate',
        total_amount: 1000.00,
        status: 'draft'
      }
    },
    {
      name: 'Invoices',
      table: 'invoices',
      sample: {
        user_id: '28dc0c62-8e09-44e3-9497-5f62c6a0b436',
        invoice_number: 'TEST-001',
        total_amount: 1500.00,
        status: 'draft'
      }
    },
    {
      name: 'Tasks',
      table: 'tasks',
      sample: {
        title: 'Test Task - RBAC',
        description: 'Testing task creation',
        status: 'pending',
        priority: 'medium',
        assigned_to: '28dc0c62-8e09-44e3-9497-5f62c6a0b436',
        created_by: '28dc0c62-8e09-44e3-9497-5f62c6a0b436'
      }
    }
  ];

  const results = {};

  // Test each module
  for (const module of modules) {
    results[module.name] = await testCRUD(module.name, module.table, module.sample);
  }

  // Test specific problematic modules
  await testTimeTrackingSpecifically();
  await testChangeOrdersSpecifically();

  // Summary
  console.log('\n📊 COMPREHENSIVE TEST SUMMARY:');
  console.log('==========================================');

  Object.entries(results).forEach(([moduleName, result]) => {
    const total = Object.values(result).filter(Boolean).length;
    const percentage = Math.round((total / 4) * 100);
    console.log(`${moduleName}: ${total}/4 operations successful (${percentage}%)`);

    if (total < 4) {
      const failed = Object.entries(result)
        .filter(([op, success]) => !success)
        .map(([op]) => op);
      console.log(`  ⚠️  Failed: ${failed.join(', ')}`);
    }
  });

  console.log('\n✅ All systems tested. Check specific errors above for any issues.');
}

// Run comprehensive test
runComprehensiveTest().catch(console.error);
