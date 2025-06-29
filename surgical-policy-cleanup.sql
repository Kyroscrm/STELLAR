-- SURGICAL POLICY CLEANUP - Remove Functional Duplicates
-- Based on actual policy analysis from estimates table
-- BACKUP YOUR DATABASE FIRST!

-- ============================================================================
-- ESTIMATES TABLE CLEANUP (25 → 7 policies)
-- Remove functional duplicates, keep best policies
-- ============================================================================

-- REMOVE DUPLICATE DELETE POLICIES (keep the admin/owner one)
DROP POLICY IF EXISTS "Users can delete own estimates" ON estimates;
DROP POLICY IF EXISTS "Users can delete their own estimates" ON estimates;
DROP POLICY IF EXISTS "estimates_delete" ON estimates;
DROP POLICY IF EXISTS "estimates_delete_own" ON estimates;
-- KEEP: "estimates_owner_admin_delete" (covers both owner and admin access)

-- REMOVE DUPLICATE INSERT POLICIES (keep one, they're all identical)
DROP POLICY IF EXISTS "Users can create estimates" ON estimates;
DROP POLICY IF EXISTS "Users can create own estimates" ON estimates;
DROP POLICY IF EXISTS "estimates_insert_own" ON estimates;
DROP POLICY IF EXISTS "estimates_owner_insert" ON estimates;
-- KEEP: "estimates_insert" (any one is fine since they're identical)

-- REMOVE DUPLICATE SELECT POLICIES (keep the comprehensive ones)
DROP POLICY IF EXISTS "Users can view own estimates" ON estimates;
DROP POLICY IF EXISTS "Users can view their own estimates" ON estimates;
DROP POLICY IF EXISTS "estimates_select" ON estimates;
DROP POLICY IF EXISTS "estimates_select_own" ON estimates;
-- KEEP: "Enable read access for users with permission" (permission system)
-- KEEP: "estimates_client_portal_access" (unique client portal access)
-- KEEP: "estimates_owner_admin_select" (covers owner + admin)

-- REMOVE DUPLICATE UPDATE POLICIES (keep the admin/owner one)
DROP POLICY IF EXISTS "Users can update own estimates" ON estimates;
DROP POLICY IF EXISTS "Users can update their own estimates" ON estimates;
DROP POLICY IF EXISTS "estimates_update" ON estimates;
DROP POLICY IF EXISTS "estimates_update_own" ON estimates;
-- KEEP: "estimates_owner_admin_update" (covers both owner and admin access)

-- REMOVE DUPLICATE ADMIN POLICIES (keep the email-based one you're using)
DROP POLICY IF EXISTS "Admin full access" ON estimates;
DROP POLICY IF EXISTS "Admin full access to estimates" ON estimates;
-- KEEP: "Admin access estimates" (email-based admin check)

-- ============================================================================
-- VERIFICATION: Check estimates table after cleanup
-- ============================================================================

-- This should show approximately 7 policies remaining
SELECT
    'ESTIMATES_AFTER_CLEANUP' as status,
    COUNT(*) as total_policies,
    COUNT(CASE WHEN cmd = 'SELECT' THEN 1 END) as select_policies,
    COUNT(CASE WHEN cmd = 'INSERT' THEN 1 END) as insert_policies,
    COUNT(CASE WHEN cmd = 'UPDATE' THEN 1 END) as update_policies,
    COUNT(CASE WHEN cmd = 'DELETE' THEN 1 END) as delete_policies,
    COUNT(CASE WHEN cmd = 'ALL' THEN 1 END) as all_policies
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'estimates';

-- Show remaining policies
SELECT
    'REMAINING_ESTIMATES_POLICIES' as info,
    policyname,
    cmd,
    CASE
        WHEN length(qual::text) > 50 THEN left(qual::text, 50) || '...'
        ELSE qual::text
    END as condition_summary
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'estimates'
ORDER BY cmd, policyname;

-- ============================================================================
-- TEMPLATE FOR OTHER TABLES (After testing estimates)
-- ============================================================================

-- After confirming estimates cleanup works, apply similar logic to:
-- customers, invoices, leads, jobs, tasks

-- For customers (similar pattern expected):
-- DROP POLICY IF EXISTS "Users can view their own customers" ON customers;
-- DROP POLICY IF EXISTS "Users can view own customers" ON customers;
-- etc...

-- Note: Don't run the other tables until we confirm estimates works!
