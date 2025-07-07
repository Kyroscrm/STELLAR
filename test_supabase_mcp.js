import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kmjgbbzbqotorocychzl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImttamdiYnpicW90b3JvY3ljaHpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4OTE5NjIsImV4cCI6MjA2NTQ2Nzk2Mn0.oys2FY7VpGnjS2w_od8dXvDRMMSJ7Hy8_5Qrg1O5DE4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSupabase() {
  try {
    const { data, error } = await supabase.from('non_existent_table').select('*');

    if (error) {
      if (error.message.includes('relation "public.non_existent_table" does not exist')) {
        console.log('✅ Supabase MCP test successful: Connected to API and received expected table not found error.');
      } else {
        console.error(`❌ Supabase MCP test failed with unexpected error: ${error.message}`);
      }
    } else {
      console.error('❌ Supabase MCP test failed: Expected an error but received data.', data);
    }
  } catch (error) {
    console.error('💥 Supabase MCP test failed with exception:', error.message);
  }
}

testSupabase();