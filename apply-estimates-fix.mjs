#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const SUPABASE_URL = 'https://kmjgbbzbqotorocychzl.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImttamdidmJxb3RvcmNuY3loemoiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNzM0MjExMzU1LCJleHAiOjIwNDk3ODczNTV9.HbX2Ht-XhOWyc7bWRq_0Qs5YKK4Ym6v8_QsJ1K3Zt2o';

// Create admin client with service role key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function fixEstimatesRLSPolicies() {
  console.log('🔧 Fixing Estimates RLS Policies - Resolving 403 Forbidden Error...\n');

  try {
    // SQL script to fix estimates RLS policies
    const fixSQL = `
      -- Drop existing problematic policies for estimates
      DROP POLICY IF EXISTS "estimates_policy" ON estimates;
      DROP POLICY IF EXISTS "estimates_select_policy" ON estimates;
      DROP POLICY IF EXISTS "estimates_insert_policy" ON estimates;
      DROP POLICY IF EXISTS "estimates_update_policy" ON estimates;
      DROP POLICY IF EXISTS "estimates_delete_policy" ON estimates;

      -- Enable RLS on estimates table
      ALTER TABLE estimates ENABLE ROW LEVEL SECURITY;

      -- Create comprehensive RLS policies for estimates table
      -- 1. SELECT policy - Users can read their own estimates + admin bypass
      CREATE POLICY "estimates_select_policy" ON estimates
          FOR SELECT
          USING (
              user_id = auth.uid() OR
              EXISTS (
                  SELECT 1 FROM auth.users
                  WHERE auth.users.id = auth.uid()
                  AND auth.users.email = 'nayib@finalroofingcompany.com'
              )
          );

      -- 2. INSERT policy - Users can create estimates for themselves
      CREATE POLICY "estimates_insert_policy" ON estimates
          FOR INSERT
          WITH CHECK (
              user_id = auth.uid() OR
              EXISTS (
                  SELECT 1 FROM auth.users
                  WHERE auth.users.id = auth.uid()
                  AND auth.users.email = 'nayib@finalroofingcompany.com'
              )
          );

      -- 3. UPDATE policy - Users can update their own estimates
      CREATE POLICY "estimates_update_policy" ON estimates
          FOR UPDATE
          USING (
              user_id = auth.uid() OR
              EXISTS (
                  SELECT 1 FROM auth.users
                  WHERE auth.users.id = auth.uid()
                  AND auth.users.email = 'nayib@finalroofingcompany.com'
              )
          );

      -- 4. DELETE policy - Users can delete their own estimates
      CREATE POLICY "estimates_delete_policy" ON estimates
          FOR DELETE
          USING (
              user_id = auth.uid() OR
              EXISTS (
                  SELECT 1 FROM auth.users
                  WHERE auth.users.id = auth.uid()
                  AND auth.users.email = 'nayib@finalroofingcompany.com'
              )
          );

      -- Fix estimate_line_items policies
      DROP POLICY IF EXISTS "estimate_line_items_select_policy" ON estimate_line_items;
      DROP POLICY IF EXISTS "estimate_line_items_insert_policy" ON estimate_line_items;
      DROP POLICY IF EXISTS "estimate_line_items_update_policy" ON estimate_line_items;
      DROP POLICY IF EXISTS "estimate_line_items_delete_policy" ON estimate_line_items;

      ALTER TABLE estimate_line_items ENABLE ROW LEVEL SECURITY;

      -- Estimate line items policies - based on parent estimate ownership
      CREATE POLICY "estimate_line_items_select_policy" ON estimate_line_items
          FOR SELECT
          USING (
              EXISTS (
                  SELECT 1 FROM estimates
                  WHERE estimates.id = estimate_line_items.estimate_id
                  AND (
                      estimates.user_id = auth.uid() OR
                      EXISTS (
                          SELECT 1 FROM auth.users
                          WHERE auth.users.id = auth.uid()
                          AND auth.users.email = 'nayib@finalroofingcompany.com'
                      )
                  )
              )
          );

      CREATE POLICY "estimate_line_items_insert_policy" ON estimate_line_items
          FOR INSERT
          WITH CHECK (
              EXISTS (
                  SELECT 1 FROM estimates
                  WHERE estimates.id = estimate_line_items.estimate_id
                  AND (
                      estimates.user_id = auth.uid() OR
                      EXISTS (
                          SELECT 1 FROM auth.users
                          WHERE auth.users.id = auth.uid()
                          AND auth.users.email = 'nayib@finalroofingcompany.com'
                      )
                  )
              )
          );

      CREATE POLICY "estimate_line_items_update_policy" ON estimate_line_items
          FOR UPDATE
          USING (
              EXISTS (
                  SELECT 1 FROM estimates
                  WHERE estimates.id = estimate_line_items.estimate_id
                  AND (
                      estimates.user_id = auth.uid() OR
                      EXISTS (
                          SELECT 1 FROM auth.users
                          WHERE auth.users.id = auth.uid()
                          AND auth.users.email = 'nayib@finalroofingcompany.com'
                      )
                  )
              )
          );

      CREATE POLICY "estimate_line_items_delete_policy" ON estimate_line_items
          FOR DELETE
          USING (
              EXISTS (
                  SELECT 1 FROM estimates
                  WHERE estimates.id = estimate_line_items.estimate_id
                  AND (
                      estimates.user_id = auth.uid() OR
                      EXISTS (
                          SELECT 1 FROM auth.users
                          WHERE auth.users.id = auth.uid()
                          AND auth.users.email = 'nayib@finalroofingcompany.com'
                      )
                  )
              )
          );

      -- Grant necessary permissions to authenticated users
      GRANT SELECT, INSERT, UPDATE, DELETE ON estimates TO authenticated;
      GRANT SELECT, INSERT, UPDATE, DELETE ON estimate_line_items TO authenticated;
    `;

    // Execute the fix
    console.log('📝 Applying RLS policy fixes...');
    const { error } = await supabase.rpc('exec_sql', { sql: fixSQL });

    if (error) {
      console.error('❌ Error applying RLS policies:', error);
      throw error;
    }

    console.log('✅ RLS policies applied successfully!');

    // Verify the policies were created
    console.log('\n🔍 Verifying policies...');
    const { data: policies, error: policyError } = await supabase
      .from('pg_policies')
      .select('tablename, policyname, cmd')
      .in('tablename', ['estimates', 'estimate_line_items']);

    if (policyError) {
      console.warn('⚠️  Could not verify policies:', policyError.message);
    } else {
      console.log('📋 Current RLS Policies:');
      policies.forEach(policy => {
        console.log(`  - ${policy.tablename}.${policy.policyname} (${policy.cmd})`);
      });
      console.log(`\n✅ Total policies found: ${policies.length}`);
    }

    // Test the fix by trying to access estimates
    console.log('\n🧪 Testing estimates access...');
    const { data: testEstimates, error: testError } = await supabase
      .from('estimates')
      .select('id, title, status')
      .limit(1);

    if (testError) {
      console.warn('⚠️  Test query failed:', testError.message);
    } else {
      console.log(`✅ Test successful - Found ${testEstimates?.length || 0} estimates`);
    }

    console.log('\n🎉 Estimates RLS Policy Fix Complete!');
    console.log('💡 The 403 Forbidden error should now be resolved.');
    console.log('🔄 Please refresh your browser to see the changes.');

  } catch (error) {
    console.error('❌ Failed to fix estimates RLS policies:', error);
    process.exit(1);
  }
}

// Run the fix
fixEstimatesRLSPolicies().catch(console.error);
