-- REMAINING TABLES CLEANUP - Based on Successful Estimates Pattern
-- Run ONLY after confirming estimates functionality works perfectly
-- BACKUP YOUR DATABASE FIRST!

-- ============================================================================
-- CUSTOMERS TABLE CLEANUP (22 → ~7 policies)
-- ============================================================================

-- REMOVE DUPLICATE CUSTOMER DELETE POLICIES
DROP POLICY IF EXISTS "Users can delete own customers" ON customers;
DROP POLICY IF EXISTS "Users can delete their own customers" ON customers;
DROP POLICY IF EXISTS "customers_delete" ON customers;
DROP POLICY IF EXISTS "customers_delete_own" ON customers;
-- KEEP: Most comprehensive delete policy (likely customers_owner_admin_delete)

-- REMOVE DUPLICATE CUSTOMER INSERT POLICIES
DROP POLICY IF EXISTS "Users can create customers" ON customers;
DROP POLICY IF EXISTS "Users can create own customers" ON customers;
DROP POLICY IF EXISTS "customers_insert_own" ON customers;
DROP POLICY IF EXISTS "customers_owner_insert" ON customers;
-- KEEP: customers_insert (any one is fine)

-- REMOVE DUPLICATE CUSTOMER SELECT POLICIES
DROP POLICY IF EXISTS "Users can view own customers" ON customers;
DROP POLICY IF EXISTS "Users can view their own customers" ON customers;
DROP POLICY IF EXISTS "customers_select" ON customers;
DROP POLICY IF EXISTS "customers_select_own" ON customers;
-- KEEP: Permission system + admin/owner + any unique policies

-- REMOVE DUPLICATE CUSTOMER UPDATE POLICIES
DROP POLICY IF EXISTS "Users can update own customers" ON customers;
DROP POLICY IF EXISTS "Users can update their own customers" ON customers;
DROP POLICY IF EXISTS "customers_update" ON customers;
DROP POLICY IF EXISTS "customers_update_own" ON customers;
-- KEEP: Most comprehensive update policy

-- REMOVE DUPLICATE ADMIN POLICIES
DROP POLICY IF EXISTS "Admin full access" ON customers;
DROP POLICY IF EXISTS "Admin full access to customers" ON customers;
-- KEEP: Email-based admin policy

-- ============================================================================
-- INVOICES TABLE CLEANUP (22 → ~7 policies)
-- ============================================================================

-- REMOVE DUPLICATE INVOICE DELETE POLICIES
DROP POLICY IF EXISTS "Users can delete own invoices" ON invoices;
DROP POLICY IF EXISTS "Users can delete their own invoices" ON invoices;
DROP POLICY IF EXISTS "invoices_delete" ON invoices;
DROP POLICY IF EXISTS "invoices_delete_own" ON invoices;

-- REMOVE DUPLICATE INVOICE INSERT POLICIES
DROP POLICY IF EXISTS "Users can create invoices" ON invoices;
DROP POLICY IF EXISTS "Users can create own invoices" ON invoices;
DROP POLICY IF EXISTS "invoices_insert_own" ON invoices;
DROP POLICY IF EXISTS "invoices_owner_insert" ON invoices;

-- REMOVE DUPLICATE INVOICE SELECT POLICIES
DROP POLICY IF EXISTS "Users can view own invoices" ON invoices;
DROP POLICY IF EXISTS "Users can view their own invoices" ON invoices;
DROP POLICY IF EXISTS "invoices_select" ON invoices;
DROP POLICY IF EXISTS "invoices_select_own" ON invoices;

-- REMOVE DUPLICATE INVOICE UPDATE POLICIES
DROP POLICY IF EXISTS "Users can update own invoices" ON invoices;
DROP POLICY IF EXISTS "Users can update their own invoices" ON invoices;
DROP POLICY IF EXISTS "invoices_update" ON invoices;
DROP POLICY IF EXISTS "invoices_update_own" ON invoices;

-- REMOVE DUPLICATE ADMIN POLICIES
DROP POLICY IF EXISTS "Admin full access" ON invoices;
DROP POLICY IF EXISTS "Admin full access to invoices" ON invoices;

-- ============================================================================
-- LEADS TABLE CLEANUP (22 → ~7 policies)
-- ============================================================================

-- REMOVE DUPLICATE LEAD DELETE POLICIES
DROP POLICY IF EXISTS "Users can delete own leads" ON leads;
DROP POLICY IF EXISTS "Users can delete their own leads" ON leads;
DROP POLICY IF EXISTS "leads_delete" ON leads;
DROP POLICY IF EXISTS "leads_delete_own" ON leads;

-- REMOVE DUPLICATE LEAD INSERT POLICIES
DROP POLICY IF EXISTS "Users can create leads" ON leads;
DROP POLICY IF EXISTS "Users can create own leads" ON leads;
DROP POLICY IF EXISTS "leads_insert_own" ON leads;
DROP POLICY IF EXISTS "leads_owner_insert" ON leads;

-- REMOVE DUPLICATE LEAD SELECT POLICIES
DROP POLICY IF EXISTS "Users can view own leads" ON leads;
DROP POLICY IF EXISTS "Users can view their own leads" ON leads;
DROP POLICY IF EXISTS "leads_select" ON leads;
DROP POLICY IF EXISTS "leads_select_own" ON leads;

-- REMOVE DUPLICATE LEAD UPDATE POLICIES
DROP POLICY IF EXISTS "Users can update own leads" ON leads;
DROP POLICY IF EXISTS "Users can update their own leads" ON leads;
DROP POLICY IF EXISTS "leads_update" ON leads;
DROP POLICY IF EXISTS "leads_update_own" ON leads;

-- REMOVE DUPLICATE ADMIN POLICIES
DROP POLICY IF EXISTS "Admin full access" ON leads;
DROP POLICY IF EXISTS "Admin full access to leads" ON leads;

-- ============================================================================
-- JOBS TABLE CLEANUP (20 → ~7 policies)
-- ============================================================================

-- REMOVE DUPLICATE JOB DELETE POLICIES
DROP POLICY IF EXISTS "Users can delete own jobs" ON jobs;
DROP POLICY IF EXISTS "Users can delete their own jobs" ON jobs;
DROP POLICY IF EXISTS "jobs_delete" ON jobs;
DROP POLICY IF EXISTS "jobs_delete_own" ON jobs;

-- REMOVE DUPLICATE JOB INSERT POLICIES
DROP POLICY IF EXISTS "Users can create jobs" ON jobs;
DROP POLICY IF EXISTS "Users can create own jobs" ON jobs;
DROP POLICY IF EXISTS "jobs_insert_own" ON jobs;
DROP POLICY IF EXISTS "jobs_owner_insert" ON jobs;

-- REMOVE DUPLICATE JOB SELECT POLICIES
DROP POLICY IF EXISTS "Users can view own jobs" ON jobs;
DROP POLICY IF EXISTS "Users can view their own jobs" ON jobs;
DROP POLICY IF EXISTS "jobs_select" ON jobs;
DROP POLICY IF EXISTS "jobs_select_own" ON jobs;

-- REMOVE DUPLICATE JOB UPDATE POLICIES
DROP POLICY IF EXISTS "Users can update own jobs" ON jobs;
DROP POLICY IF EXISTS "Users can update their own jobs" ON jobs;
DROP POLICY IF EXISTS "jobs_update" ON jobs;
DROP POLICY IF EXISTS "jobs_update_own" ON jobs;

-- REMOVE DUPLICATE ADMIN POLICIES
DROP POLICY IF EXISTS "Admin full access" ON jobs;
DROP POLICY IF EXISTS "Admin full access to jobs" ON jobs;

-- ============================================================================
-- TASKS TABLE CLEANUP (19 → ~7 policies)
-- ============================================================================

-- REMOVE DUPLICATE TASK DELETE POLICIES
DROP POLICY IF EXISTS "Users can delete own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can delete their own tasks" ON tasks;
DROP POLICY IF EXISTS "tasks_delete" ON tasks;
DROP POLICY IF EXISTS "tasks_delete_own" ON tasks;

-- REMOVE DUPLICATE TASK INSERT POLICIES
DROP POLICY IF EXISTS "Users can create tasks" ON tasks;
DROP POLICY IF EXISTS "Users can create own tasks" ON tasks;
DROP POLICY IF EXISTS "tasks_insert_own" ON tasks;
DROP POLICY IF EXISTS "tasks_owner_insert" ON tasks;

-- REMOVE DUPLICATE TASK SELECT POLICIES
DROP POLICY IF EXISTS "Users can view own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can view their own tasks" ON tasks;
DROP POLICY IF EXISTS "tasks_select" ON tasks;
DROP POLICY IF EXISTS "tasks_select_own" ON tasks;

-- REMOVE DUPLICATE TASK UPDATE POLICIES
DROP POLICY IF EXISTS "Users can update own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can update their own tasks" ON tasks;
DROP POLICY IF EXISTS "tasks_update" ON tasks;
DROP POLICY IF EXISTS "tasks_update_own" ON tasks;

-- REMOVE DUPLICATE ADMIN POLICIES
DROP POLICY IF EXISTS "Admin full access" ON tasks;
DROP POLICY IF EXISTS "Admin full access to tasks" ON tasks;

-- ============================================================================
-- VERIFICATION: Check all tables after cleanup
-- ============================================================================

-- Final policy count for all cleaned tables
SELECT
    'FINAL_POLICY_COUNT' as status,
    tablename,
    COUNT(*) as total_policies,
    COUNT(CASE WHEN cmd = 'SELECT' THEN 1 END) as select_policies,
    COUNT(CASE WHEN cmd = 'INSERT' THEN 1 END) as insert_policies,
    COUNT(CASE WHEN cmd = 'UPDATE' THEN 1 END) as update_policies,
    COUNT(CASE WHEN cmd = 'DELETE' THEN 1 END) as delete_policies,
    COUNT(CASE WHEN cmd = 'ALL' THEN 1 END) as all_policies
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('estimates', 'customers', 'invoices', 'leads', 'jobs', 'tasks')
GROUP BY tablename
ORDER BY total_policies DESC;
