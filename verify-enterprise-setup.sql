-- Enterprise Tables Verification and Fix Script
-- Run this in Supabase Dashboard > SQL Editor

-- 1. Check which enterprise tables exist
SELECT
  table_name,
  CASE WHEN pg_class.oid IS NOT NULL THEN 'EXISTS' ELSE 'MISSING' END as status
FROM (
  VALUES
    ('crews'), ('crew_members'), ('materials'), ('job_materials'),
    ('time_entries'), ('change_orders'), ('recurring_invoices'),
    ('credit_notes'), ('expenses'), ('communication_templates'),
    ('workflow_logs'), ('report_templates')
) AS expected(table_name)
LEFT JOIN pg_class ON pg_class.relname = expected.table_name
  AND pg_class.relkind = 'r'
  AND pg_namespace.nspname = 'public'
LEFT JOIN pg_namespace ON pg_namespace.oid = pg_class.relnamespace
ORDER BY table_name;

-- 2. Check RLS status for enterprise tables
SELECT
  schemaname,
  tablename,
  rowsecurity,
  CASE WHEN rowsecurity THEN 'ENABLED' ELSE 'DISABLED' END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'crews', 'crew_members', 'materials', 'job_materials',
    'time_entries', 'change_orders', 'recurring_invoices',
    'credit_notes', 'expenses', 'communication_templates',
    'workflow_logs', 'report_templates'
  )
ORDER BY tablename;

-- 3. Enable RLS on all enterprise tables (if needed)
ALTER TABLE IF EXISTS crews ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS crew_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS job_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS change_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS recurring_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS credit_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS communication_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS workflow_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS report_templates ENABLE ROW LEVEL SECURITY;

-- 4. Check if RLS policies exist
SELECT
  schemaname,
  tablename,
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN (
    'crews', 'crew_members', 'materials', 'job_materials',
    'time_entries', 'change_orders', 'recurring_invoices',
    'credit_notes', 'expenses', 'communication_templates',
    'workflow_logs', 'report_templates'
  )
ORDER BY tablename, policyname;

-- 5. Create basic RLS policies for crews if missing
DO $$
BEGIN
  -- Only create if table exists and policy doesn't exist
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'crews' AND schemaname = 'public') THEN

    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Users can view crews they belong to" ON crews;
    DROP POLICY IF EXISTS "Users can create crews with permission" ON crews;
    DROP POLICY IF EXISTS "Users can update crews they lead or with permission" ON crews;
    DROP POLICY IF EXISTS "Users can delete crews with permission" ON crews;

    -- Create new policies
    CREATE POLICY "Users can view crews they belong to" ON crews
      FOR SELECT USING (
        has_permission(auth.uid(), 'crews', 'read') OR
        lead_id = auth.uid() OR
        id IN (SELECT crew_id FROM crew_members WHERE user_id = auth.uid())
      );

    CREATE POLICY "Users can create crews with permission" ON crews
      FOR INSERT WITH CHECK (has_permission(auth.uid(), 'crews', 'create'));

    CREATE POLICY "Users can update crews they lead or with permission" ON crews
      FOR UPDATE USING (
        has_permission(auth.uid(), 'crews', 'update') OR
        lead_id = auth.uid()
      );

    CREATE POLICY "Users can delete crews with permission" ON crews
      FOR DELETE USING (has_permission(auth.uid(), 'crews', 'delete'));

  END IF;
END $$;

-- 6. Final verification
SELECT
  'Enterprise Tables Status' as report_section,
  COUNT(*) as total_tables,
  COUNT(CASE WHEN rowsecurity THEN 1 END) as rls_enabled_tables
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'crews', 'crew_members', 'materials', 'job_materials',
    'time_entries', 'change_orders', 'recurring_invoices',
    'credit_notes', 'expenses', 'communication_templates',
    'workflow_logs', 'report_templates'
  );

-- 7. Show sample data structure
\d crews;
