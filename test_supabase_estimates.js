const supabaseUrl = 'https://kmjgbbzbqotorocychzl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImttamdiYnpicW90b3JvY3ljaHpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4OTE5NjIsImV4cCI6MjA2NTQ2Nzk2Mn0.oys2FY7VpGnjS2w_od8dXvDRMMSJ7Hy8_5Qrg1O5DE4';

async function testSupabaseEstimates() {
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/estimates?limit=1`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey
      }
    });

    if (response.ok) {
      console.log('✅ Supabase MCP test successful: Fetched from estimates table.');
      const data = await response.json();
      console.log('Response data (first record):', data[0]);
    } else {
      const errorText = await response.text();
      console.error(`❌ Supabase MCP test failed: ${response.status} - ${errorText}`);
    }
  } catch (error) {
    console.error('💥 Supabase MCP test failed with exception:', error.message);
  }
}

testSupabaseEstimates();
