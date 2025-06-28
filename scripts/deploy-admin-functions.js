#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local');
let supabaseUrl = '';
let supabaseKey = '';

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const envLines = envContent.split('\n');

  for (const line of envLines) {
    if (line.startsWith('VITE_SUPABASE_URL=')) {
      supabaseUrl = line.replace('VITE_SUPABASE_URL=', '').trim();
    } else if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) {
      supabaseKey = line.replace('SUPABASE_SERVICE_ROLE_KEY=', '').trim();
    }
  }
}

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function main() {
  console.log('=== Supabase Admin Functions Deployment ===');

  // Get Supabase URL and service role key if not found in .env.local
  if (!supabaseUrl) {
    supabaseUrl = await askQuestion('Enter your Supabase URL: ');
  } else {
    console.log(`Using Supabase URL from .env.local: ${supabaseUrl}`);
  }

  if (!supabaseKey) {
    supabaseKey = await askQuestion('Enter your Supabase service role key: ');

    // Save to .env.local
    const envContent = fs.existsSync(envPath)
      ? fs.readFileSync(envPath, 'utf-8')
      : `VITE_SUPABASE_URL=${supabaseUrl}`;

    let updatedContent = '';

    if (envContent.includes('SUPABASE_SERVICE_ROLE_KEY=')) {
      updatedContent = envContent.replace(/SUPABASE_SERVICE_ROLE_KEY=.*/g, `SUPABASE_SERVICE_ROLE_KEY=${supabaseKey}`);
    } else {
      updatedContent = `${envContent}\nSUPABASE_SERVICE_ROLE_KEY=${supabaseKey}`;
    }

    fs.writeFileSync(envPath, updatedContent);
    console.log('Service role key saved to .env.local');
  } else {
    console.log('Using Supabase service role key from .env.local');
  }

  // Deploy admin functions SQL
  const adminSqlPath = path.join(process.cwd(), 'supabase/migrations/20250630100000-admin-sql-functions.sql');

  if (!fs.existsSync(adminSqlPath)) {
    console.error(`Error: Admin SQL functions file not found at ${adminSqlPath}`);
    process.exit(1);
  }

  console.log('Deploying admin SQL functions to Supabase...');

  try {
    // Using psql to execute SQL file
    const psqlCommand = `PGPASSWORD=${supabaseKey} psql -h ${supabaseUrl.replace('https://', '')} -U postgres -f ${adminSqlPath}`;

    console.log('Running SQL deployment...');
    execSync(psqlCommand, { stdio: 'inherit' });

    console.log('\n✅ Admin SQL functions deployed successfully!');
    console.log(`\nYou can now use the admin client in your code by importing from 'src/integrations/supabase/admin-client.ts'`);
  } catch (error) {
    console.error('Error deploying SQL functions:', error);
    console.log('\nTroubleshooting:');
    console.log('1. Make sure you have psql installed on your system');
    console.log('2. Verify your Supabase URL and service role key are correct');
    console.log('3. Check that you have proper permissions to execute SQL on your database');
  }

  rl.close();
}

main().catch(console.error);
