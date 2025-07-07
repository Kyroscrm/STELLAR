const supabaseUrl = 'https://kmjgbbzbqotorocychzl.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImttamdiYnpicW90b3JvY3ljaHpsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTg5MTk2MiwiZXhwIjoyMDY1NDY3OTYyfQ.olo5LqWfypY6nMpfEsLFXyKb4xQhCyetcYRyrPd0bAA';

async function getRlsPolicies() {
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/execute_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey
      },
      body: JSON.stringify({ sql: "SELECT tablename, policyname, permissive, roles, cmd, qual FROM pg_policies WHERE schemaname = 'public';" })
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Successfully fetched RLS policies:');
      console.log(JSON.stringify(data, null, 2));
    } else {
      const errorText = await response.text();
      console.error(`❌ Failed to fetch RLS policies: ${response.status} - ${errorText}`);
    }
  } catch (error) {
    console.error('💥 Error fetching RLS policies:', error.message);
  }
}

getRlsPolicies();
