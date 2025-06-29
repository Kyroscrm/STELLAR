-- COMPREHENSIVE DUPLICATE POLICY CHECKER
-- Run this script in Supabase SQL Editor to identify potential policy conflicts

-- 1. Check for exact duplicate policies (same name, table, definition)
SELECT
    'EXACT_DUPLICATE' as issue_type,
    tablename,
    policyname,
    cmd as command_type,
    COUNT(*) as duplicate_count,
    STRING_AGG(DISTINCT qual::text, ' | ') as policy_conditions,
    STRING_AGG(DISTINCT with_check::text, ' | ') as with_check_conditions
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename, policyname, cmd, qual, with_check
HAVING COUNT(*) > 1
ORDER BY tablename, policyname;

-- 2. Check for policies with same name but different definitions (potential conflicts)
SELECT
    'NAME_CONFLICT' as issue_type,
    tablename,
    policyname,
    COUNT(DISTINCT qual::text) as different_conditions,
    COUNT(DISTINCT with_check::text) as different_with_checks,
    STRING_AGG(DISTINCT cmd::text, ', ') as command_types,
    STRING_AGG(DISTINCT qual::text, ' | ') as all_conditions
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename, policyname
HAVING COUNT(DISTINCT qual::text) > 1 OR COUNT(DISTINCT with_check::text) > 1
ORDER BY tablename, policyname;

-- 3. Check for overlapping policies that might cause conflicts
SELECT
    'POTENTIAL_OVERLAP' as issue_type,
    tablename,
    cmd as command_type,
    COUNT(*) as policy_count,
    STRING_AGG(policyname, ', ') as policy_names,
    STRING_AGG(DISTINCT roles::text, ' | ') as roles_affected
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename, cmd
HAVING COUNT(*) > 3  -- More than 3 policies of same type might indicate redundancy
ORDER BY tablename, cmd;

-- 4. List all current policies by table for review
SELECT
    'CURRENT_POLICIES' as info_type,
    tablename,
    policyname,
    cmd,
    permissive,
    roles,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, cmd, policyname;

-- 5. Check for policies that might be contradictory (RESTRICTIVE vs PERMISSIVE)
SELECT
    'CONTRADICTORY_POLICIES' as issue_type,
    tablename,
    cmd,
    COUNT(CASE WHEN permissive = 'PERMISSIVE' THEN 1 END) as permissive_count,
    COUNT(CASE WHEN permissive = 'RESTRICTIVE' THEN 1 END) as restrictive_count,
    STRING_AGG(CASE WHEN permissive = 'PERMISSIVE' THEN policyname END, ', ') as permissive_policies,
    STRING_AGG(CASE WHEN permissive = 'RESTRICTIVE' THEN policyname END, ', ') as restrictive_policies
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename, cmd
HAVING COUNT(CASE WHEN permissive = 'PERMISSIVE' THEN 1 END) > 0
   AND COUNT(CASE WHEN permissive = 'RESTRICTIVE' THEN 1 END) > 0
ORDER BY tablename, cmd;

-- 6. Check for policies with identical conditions but different names
SELECT
    'IDENTICAL_CONDITIONS' as issue_type,
    tablename,
    cmd,
    qual,
    with_check,
    COUNT(*) as policy_count,
    STRING_AGG(policyname, ', ') as policy_names
FROM pg_policies
WHERE schemaname = 'public'
  AND qual IS NOT NULL
GROUP BY tablename, cmd, qual, with_check
HAVING COUNT(*) > 1
ORDER BY tablename, cmd;

-- 7. Summary of all policies by table
SELECT
    'POLICY_SUMMARY' as info_type,
    tablename,
    COUNT(*) as total_policies,
    COUNT(DISTINCT cmd) as command_types,
    STRING_AGG(DISTINCT cmd::text, ', ') as commands,
    COUNT(CASE WHEN cmd = 'SELECT' THEN 1 END) as select_policies,
    COUNT(CASE WHEN cmd = 'INSERT' THEN 1 END) as insert_policies,
    COUNT(CASE WHEN cmd = 'UPDATE' THEN 1 END) as update_policies,
    COUNT(CASE WHEN cmd = 'DELETE' THEN 1 END) as delete_policies
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY total_policies DESC, tablename;
