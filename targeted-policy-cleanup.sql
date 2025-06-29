-- TARGETED POLICY CLEANUP FOR STELLAR CRM
-- Based on your specific duplicate policy analysis
-- CRITICAL: Take a database backup before running this cleanup

-- ============================================================================
-- STEP 1: IDENTIFY EXACT DUPLICATES (Run this first to see what will be removed)
-- ============================================================================

-- Check for exact duplicate policies on main CRM tables
SELECT
    'DUPLICATE_FOUND' as status,
    tablename,
    policyname,
    cmd,
    COUNT(*) as duplicate_count
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('estimates', 'customers', 'invoices', 'leads', 'jobs', 'tasks',
                    'estimate_line_items', 'invoice_line_items', 'calendar_events')
GROUP BY tablename, policyname, cmd, qual, with_check
HAVING COUNT(*) > 1
ORDER BY tablename, duplicate_count DESC;

-- ============================================================================
-- STEP 2: SAFE CLEANUP (Uncomment sections below after reviewing Step 1 results)
-- ============================================================================

-- WARNING: Only uncomment and run these sections after reviewing the duplicates above!

-- ESTIMATES TABLE CLEANUP (25 → 4 policies)
-- DROP POLICY IF EXISTS "Enable read access for users with permission" ON estimates;
-- DROP POLICY IF EXISTS "Enable insert for users with permission" ON estimates;
-- DROP POLICY IF EXISTS "Enable update for users with permission" ON estimates;
-- DROP POLICY IF EXISTS "Enable delete for users with permission" ON estimates;
-- -- Keep any policies with more specific names or recent creation dates

-- CUSTOMERS TABLE CLEANUP (22 → 4 policies)
-- DROP POLICY IF EXISTS "Enable read access for users with permission" ON customers;
-- DROP POLICY IF EXISTS "Enable insert for users with permission" ON customers;
-- DROP POLICY IF EXISTS "Enable update for users with permission" ON customers;
-- DROP POLICY IF EXISTS "Enable delete for users with permission" ON customers;

-- INVOICES TABLE CLEANUP (22 → 4 policies)
-- DROP POLICY IF EXISTS "Enable read access for users with permission" ON invoices;
-- DROP POLICY IF EXISTS "Enable insert for users with permission" ON invoices;
-- DROP POLICY IF EXISTS "Enable update for users with permission" ON invoices;
-- DROP POLICY IF EXISTS "Enable delete for users with permission" ON invoices;

-- LEADS TABLE CLEANUP (22 → 4 policies)
-- DROP POLICY IF EXISTS "Enable read access for users with permission" ON leads;
-- DROP POLICY IF EXISTS "Enable insert for users with permission" ON leads;
-- DROP POLICY IF EXISTS "Enable update for users with permission" ON leads;
-- DROP POLICY IF EXISTS "Enable delete for users with permission" ON leads;

-- JOBS TABLE CLEANUP (20 → 4 policies)
-- DROP POLICY IF EXISTS "Enable read access for users with permission" ON jobs;
-- DROP POLICY IF EXISTS "Enable insert for users with permission" ON jobs;
-- DROP POLICY IF EXISTS "Enable update for users with permission" ON jobs;
-- DROP POLICY IF EXISTS "Enable delete for users with permission" ON jobs;

-- TASKS TABLE CLEANUP (19 → 4 policies)
-- DROP POLICY IF EXISTS "Enable read access for users with permission" ON tasks;
-- DROP POLICY IF EXISTS "Enable insert for users with permission" ON tasks;
-- DROP POLICY IF EXISTS "Enable update for users with permission" ON tasks;
-- DROP POLICY IF EXISTS "Enable delete for users with permission" ON tasks;

-- LINE ITEMS CLEANUP
-- DROP POLICY IF EXISTS "Enable read access for users with permission" ON estimate_line_items;
-- DROP POLICY IF EXISTS "Enable insert for users with permission" ON estimate_line_items;
-- DROP POLICY IF EXISTS "Enable update for users with permission" ON estimate_line_items;
-- DROP POLICY IF EXISTS "Enable delete for users with permission" ON estimate_line_items;

-- DROP POLICY IF EXISTS "Enable read access for users with permission" ON invoice_line_items;
-- DROP POLICY IF EXISTS "Enable insert for users with permission" ON invoice_line_items;
-- DROP POLICY IF EXISTS "Enable update for users with permission" ON invoice_line_items;
-- DROP POLICY IF EXISTS "Enable delete for users with permission" ON invoice_line_items;

-- ============================================================================
-- STEP 3: RECREATE CLEAN POLICIES (Run after cleanup)
-- ============================================================================

-- Template for recreating clean, single policies per operation:

-- FOR ESTIMATES:
-- CREATE POLICY "estimates_select_policy" ON estimates
--     FOR SELECT USING (has_permission(auth.uid(), 'estimates:read'));
-- CREATE POLICY "estimates_insert_policy" ON estimates
--     FOR INSERT WITH CHECK (has_permission(auth.uid(), 'estimates:create'));
-- CREATE POLICY "estimates_update_policy" ON estimates
--     FOR UPDATE USING (has_permission(auth.uid(), 'estimates:update'));
-- CREATE POLICY "estimates_delete_policy" ON estimates
--     FOR DELETE USING (has_permission(auth.uid(), 'estimates:delete'));

-- Repeat similar pattern for other tables...

-- ============================================================================
-- STEP 4: VERIFY CLEANUP SUCCESS
-- ============================================================================

-- Run this to confirm policy counts are now reasonable:
SELECT
    'POST_CLEANUP' as status,
    tablename,
    COUNT(*) as total_policies,
    COUNT(CASE WHEN cmd = 'SELECT' THEN 1 END) as select_policies,
    COUNT(CASE WHEN cmd = 'INSERT' THEN 1 END) as insert_policies,
    COUNT(CASE WHEN cmd = 'UPDATE' THEN 1 END) as update_policies,
    COUNT(CASE WHEN cmd = 'DELETE' THEN 1 END) as delete_policies
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('estimates', 'customers', 'invoices', 'leads', 'jobs', 'tasks',
                    'estimate_line_items', 'invoice_line_items')
GROUP BY tablename
ORDER BY total_policies DESC;
