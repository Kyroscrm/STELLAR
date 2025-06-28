-- Fixed Diagnostic Script for RBAC Issues
-- Run this in Supabase SQL Editor to check what's wrong

-- Check 1: Verify admin user exists in profiles (without full_name)
SELECT 'Admin User Check' as check_name,
       id, role_id
FROM public.profiles
WHERE id = '28dc0c62-8e09-44e3-9497-5f62c6a0b436';

-- Check 2: See what columns actually exist in profiles table
SELECT 'Profiles Table Structure' as check_name,
       column_name, data_type
FROM information_schema.columns
WHERE table_name = 'profiles' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check 3: Verify roles exist
SELECT 'Roles Check' as check_name,
       id, name, description
FROM public.roles
ORDER BY name;

-- Check 4: Verify permissions exist
SELECT 'Permissions Check' as check_name,
       COUNT(*) as permission_count
FROM public.permissions;

-- Check 5: Show first few permissions
SELECT 'Sample Permissions' as check_name,
       name, resource, action
FROM public.permissions
LIMIT 5;

-- Check 6: Verify role_permissions connections exist
SELECT 'Role Permissions Check' as check_name,
       COUNT(*) as connection_count
FROM public.role_permissions;

-- Check 7: Detailed check of admin role and permissions
SELECT 'Admin Role Details' as check_name,
       r.name as role_name,
       p.name as permission_name,
       p.resource,
       p.action
FROM public.roles r
JOIN public.role_permissions rp ON r.id = rp.role_id
JOIN public.permissions p ON rp.permission_id = p.id
WHERE r.name = 'admin'
ORDER BY p.name
LIMIT 10;

-- Check 8: Verify the specific user's role assignment
SELECT 'User Role Assignment' as check_name,
       prof.id as user_id,
       prof.role_id,
       r.name as role_name,
       r.description as role_description
FROM public.profiles prof
LEFT JOIN public.roles r ON prof.role_id = r.id
WHERE prof.id = '28dc0c62-8e09-44e3-9497-5f62c6a0b436';

-- Check 9: Test the exact query that useRBAC hook uses
SELECT 'Hook Query Test' as check_name,
       p.role_id,
       r.id as role_id_from_join,
       r.name as role_name,
       r.description as role_description
FROM public.profiles p
LEFT JOIN public.roles r ON p.role_id = r.id
WHERE p.id = '28dc0c62-8e09-44e3-9497-5f62c6a0b436';

-- Check 10: Test permissions query for admin role
WITH user_role AS (
    SELECT r.id as role_id, r.name as role_name
    FROM public.profiles p
    JOIN public.roles r ON p.role_id = r.id
    WHERE p.id = '28dc0c62-8e09-44e3-9497-5f62c6a0b436'
)
SELECT 'Permissions for User' as check_name,
       perm.id,
       perm.name,
       perm.description,
       perm.resource,
       perm.action
FROM user_role ur
JOIN public.role_permissions rp ON ur.role_id = rp.role_id
JOIN public.permissions perm ON rp.permission_id = perm.id
ORDER BY perm.name
LIMIT 10;

-- Final summary
SELECT 'Summary' as check_name,
       'Diagnostic complete' as result;
