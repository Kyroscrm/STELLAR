-- DUPLICATE POLICY CLEANUP SCRIPT
-- IMPORTANT: Only run this AFTER reviewing the results from check-duplicate-policies.sql
-- BACKUP RECOMMENDATION: Take a database backup before running cleanup

-- Template for removing duplicate policies
-- REPLACE 'table_name' and 'policy_name' with actual values from your duplicate check

-- Example: Remove a specific duplicate policy
-- DROP POLICY IF EXISTS "duplicate_policy_name" ON table_name;

-- Common duplicates that might exist (based on typical patterns):

-- 1. Check for and remove duplicate "Enable read access" policies
-- DO $$
-- DECLARE
--     pol_record RECORD;
-- BEGIN
--     FOR pol_record IN
--         SELECT tablename, policyname, COUNT(*) as cnt
--         FROM pg_policies
--         WHERE schemaname = 'public'
--           AND policyname LIKE '%read access%'
--         GROUP BY tablename, policyname
--         HAVING COUNT(*) > 1
--     LOOP
--         RAISE NOTICE 'Found duplicate read access policy on table: %, policy: %', pol_record.tablename, pol_record.policyname;
--         -- Uncomment the line below to actually drop duplicates
--         -- EXECUTE format('DROP POLICY IF EXISTS %I ON %I', pol_record.policyname, pol_record.tablename);
--     END LOOP;
-- END $$;

-- 2. Template for removing exact duplicate policies safely
-- This will keep the first policy and remove subsequent duplicates

-- EXAMPLE CLEANUP (UNCOMMENT AND MODIFY AS NEEDED):

-- For customers table
-- DROP POLICY IF EXISTS "Enable read access for users with permission" ON customers;
-- DROP POLICY IF EXISTS "Enable insert for users with permission" ON customers;
-- DROP POLICY IF EXISTS "Enable update for users with permission" ON customers;
-- DROP POLICY IF EXISTS "Enable delete for users with permission" ON customers;

-- For leads table
-- DROP POLICY IF EXISTS "Enable read access for users with permission" ON leads;
-- DROP POLICY IF EXISTS "Enable insert for users with permission" ON leads;
-- DROP POLICY IF EXISTS "Enable update for users with permission" ON leads;
-- DROP POLICY IF EXISTS "Enable delete for users with permission" ON leads;

-- For estimates table
-- DROP POLICY IF EXISTS "Enable read access for users with permission" ON estimates;
-- DROP POLICY IF EXISTS "Enable insert for users with permission" ON estimates;
-- DROP POLICY IF EXISTS "Enable update for users with permission" ON estimates;
-- DROP POLICY IF EXISTS "Enable delete for users with permission" ON estimates;

-- For invoices table
-- DROP POLICY IF EXISTS "Enable read access for users with permission" ON invoices;
-- DROP POLICY IF EXISTS "Enable insert for users with permission" ON invoices;
-- DROP POLICY IF EXISTS "Enable update for users with permission" ON invoices;
-- DROP POLICY IF EXISTS "Enable delete for users with permission" ON invoices;

-- For jobs table
-- DROP POLICY IF EXISTS "Enable read access for users with permission" ON jobs;
-- DROP POLICY IF EXISTS "Enable insert for users with permission" ON jobs;
-- DROP POLICY IF EXISTS "Enable update for users with permission" ON jobs;
-- DROP POLICY IF EXISTS "Enable delete for users with permission" ON jobs;

-- For tasks table
-- DROP POLICY IF EXISTS "Enable read access for users with permission" ON tasks;
-- DROP POLICY IF EXISTS "Enable insert for users with permission" ON tasks;
-- DROP POLICY IF EXISTS "Enable update for users with permission" ON tasks;
-- DROP POLICY IF EXISTS "Enable delete for users with permission" ON tasks;

-- 3. After cleanup, recreate clean policies if needed
-- Example template for standard RLS policies:

-- CREATE POLICY "Enable read access for users with permission" ON table_name
--     FOR SELECT USING (has_permission(auth.uid(), 'table_name:read'));

-- CREATE POLICY "Enable insert for users with permission" ON table_name
--     FOR INSERT WITH CHECK (has_permission(auth.uid(), 'table_name:create'));

-- CREATE POLICY "Enable update for users with permission" ON table_name
--     FOR UPDATE USING (has_permission(auth.uid(), 'table_name:update'))
--     WITH CHECK (has_permission(auth.uid(), 'table_name:update'));

-- CREATE POLICY "Enable delete for users with permission" ON table_name
--     FOR DELETE USING (has_permission(auth.uid(), 'table_name:delete'));

-- 4. Verify cleanup was successful
SELECT
    'POST_CLEANUP_CHECK' as status,
    tablename,
    COUNT(*) as remaining_policies,
    STRING_AGG(policyname, ', ') as policy_names
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;
