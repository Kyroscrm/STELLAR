import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = 'https://kmjgbbzbqotorocychzl.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || 'your-service-key-here';

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function applyRLSFix() {
  try {
    console.log('Reading migration file...');
    const migrationSQL = fs.readFileSync(
      path.join(process.cwd(), 'supabase/migrations/20250614204454_fix_estimates_rls.sql'),
      'utf8'
    );

    console.log('Applying RLS fixes...');
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: migrationSQL
    });

    if (error) {
      console.error('Error applying RLS fixes:', error);
      process.exit(1);
    }

    console.log('RLS fixes applied successfully!');
    console.log('Verifying policies...');

    const { data: policies, error: policiesError } = await supabase
      .from('pg_policies')
      .select('*')
      .eq('tablename', 'estimates');

    if (policiesError) {
      console.error('Error verifying policies:', policiesError);
      process.exit(1);
    }

    console.log('Current policies on estimates table:');
    console.log(JSON.stringify(policies, null, 2));

  } catch (error) {
    console.error('Unexpected error:', error);
    process.exit(1);
  }
}

applyRLSFix();
