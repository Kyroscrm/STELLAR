-- Simple Enterprise Tables Check & Fix
-- Run each section separately in Supabase Dashboard > SQL Editor

-- SECTION 1: Check which enterprise tables exist
SELECT
  'crews' as table_name,
  CASE WHEN to_regclass('public.crews') IS NOT NULL THEN 'EXISTS' ELSE 'MISSING' END as status
UNION ALL
SELECT
  'crew_members' as table_name,
  CASE WHEN to_regclass('public.crew_members') IS NOT NULL THEN 'EXISTS' ELSE 'MISSING' END as status
UNION ALL
SELECT
  'materials' as table_name,
  CASE WHEN to_regclass('public.materials') IS NOT NULL THEN 'EXISTS' ELSE 'MISSING' END as status
UNION ALL
SELECT
  'job_materials' as table_name,
  CASE WHEN to_regclass('public.job_materials') IS NOT NULL THEN 'EXISTS' ELSE 'MISSING' END as status
UNION ALL
SELECT
  'time_entries' as table_name,
  CASE WHEN to_regclass('public.time_entries') IS NOT NULL THEN 'EXISTS' ELSE 'MISSING' END as status
UNION ALL
SELECT
  'change_orders' as table_name,
  CASE WHEN to_regclass('public.change_orders') IS NOT NULL THEN 'EXISTS' ELSE 'MISSING' END as status
UNION ALL
SELECT
  'recurring_invoices' as table_name,
  CASE WHEN to_regclass('public.recurring_invoices') IS NOT NULL THEN 'EXISTS' ELSE 'MISSING' END as status
UNION ALL
SELECT
  'credit_notes' as table_name,
  CASE WHEN to_regclass('public.credit_notes') IS NOT NULL THEN 'EXISTS' ELSE 'MISSING' END as status
UNION ALL
SELECT
  'expenses' as table_name,
  CASE WHEN to_regclass('public.expenses') IS NOT NULL THEN 'EXISTS' ELSE 'MISSING' END as status
UNION ALL
SELECT
  'communication_templates' as table_name,
  CASE WHEN to_regclass('public.communication_templates') IS NOT NULL THEN 'EXISTS' ELSE 'MISSING' END as status
UNION ALL
SELECT
  'workflow_logs' as table_name,
  CASE WHEN to_regclass('public.workflow_logs') IS NOT NULL THEN 'EXISTS' ELSE 'MISSING' END as status
UNION ALL
SELECT
  'report_templates' as table_name,
  CASE WHEN to_regclass('public.report_templates') IS NOT NULL THEN 'EXISTS' ELSE 'MISSING' END as status
ORDER BY table_name;

-- SECTION 2: Enable RLS on all enterprise tables
ALTER TABLE crews ENABLE ROW LEVEL SECURITY;

-- SECTION 3: Create basic policy for crews table
DROP POLICY IF EXISTS "Users can view crews" ON crews;
CREATE POLICY "Users can view crews" ON crews FOR ALL USING (true);

-- SECTION 4: Check RLS status
SELECT
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename = 'crews';

-- SECTION 5: Test crews table access
SELECT COUNT(*) as crews_count FROM crews;
