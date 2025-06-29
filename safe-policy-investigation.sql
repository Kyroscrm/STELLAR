-- SAFE POLICY INVESTIGATION - NO CHANGES MADE
-- This script only shows information, doesn't delete anything
-- Run this first to see exactly what policies exist

-- ============================================================================
-- INVESTIGATION 1: Look at actual policy names and conditions for main tables
-- ============================================================================

-- Check estimates table policies (25 total - let's see what they actually are)
SELECT
    'ESTIMATES_POLICIES' as table_info,
    policyname,
    cmd,
    permissive,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'estimates'
ORDER BY cmd, policyname;

-- Check customers table policies (22 total)
SELECT
    'CUSTOMERS_POLICIES' as table_info,
    policyname,
    cmd,
    permissive,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'customers'
ORDER BY cmd, policyname;

-- Check invoices table policies (22 total)
SELECT
    'INVOICES_POLICIES' as table_info,
    policyname,
    cmd,
    permissive,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'invoices'
ORDER BY cmd, policyname;

-- ============================================================================
-- INVESTIGATION 2: Find actual exact duplicates (same name, same conditions)
-- ============================================================================

-- Find policies with identical names and conditions
SELECT
    'EXACT_DUPLICATES' as issue_type,
    tablename,
    policyname,
    cmd,
    COUNT(*) as duplicate_count,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('estimates', 'customers', 'invoices', 'leads', 'jobs', 'tasks')
GROUP BY tablename, policyname, cmd, qual, with_check
HAVING COUNT(*) > 1
ORDER BY tablename, duplicate_count DESC;

-- ============================================================================
-- INVESTIGATION 3: Find policies with same name but different conditions
-- ============================================================================

-- Find policies that have the same name but different logic (potentially problematic)
SELECT
    'CONFLICTING_NAMES' as issue_type,
    tablename,
    policyname,
    COUNT(DISTINCT qual::text) as different_conditions,
    COUNT(*) as total_policies,
    STRING_AGG(DISTINCT cmd::text, ', ') as commands,
    STRING_AGG(DISTINCT qual::text, ' || ') as all_conditions
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('estimates', 'customers', 'invoices', 'leads', 'jobs', 'tasks')
GROUP BY tablename, policyname
HAVING COUNT(DISTINCT qual::text) > 1 OR COUNT(*) > 1
ORDER BY tablename, total_policies DESC;

-- ============================================================================
-- INVESTIGATION 4: Check line items tables specifically
-- ============================================================================

-- Check if line items tables really have 4 of each policy type
SELECT
    'LINE_ITEMS_CHECK' as info_type,
    tablename,
    policyname,
    cmd,
    qual
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('estimate_line_items', 'invoice_line_items')
ORDER BY tablename, cmd, policyname;

-- ============================================================================
-- INVESTIGATION 5: Summary of what needs attention
-- ============================================================================

-- Show only tables that definitely have too many policies
SELECT
    'NEEDS_ATTENTION' as status,
    tablename,
    COUNT(*) as total_policies,
    COUNT(CASE WHEN cmd = 'SELECT' THEN 1 END) as select_policies,
    'Should have 1-2 SELECT policies max' as recommendation
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('estimates', 'customers', 'invoices', 'leads', 'jobs', 'tasks')
GROUP BY tablename
HAVING COUNT(CASE WHEN cmd = 'SELECT' THEN 1 END) > 2
ORDER BY COUNT(*) DESC;
