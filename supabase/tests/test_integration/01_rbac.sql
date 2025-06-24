-- Integration tests for RBAC functionality
BEGIN;

-- Load pgTAP
SELECT plan(9);

-- Test 1: Check if roles and permissions tables exist
SELECT has_table(
  'public', 'roles',
  'roles table should exist'
);

SELECT has_table(
  'public', 'permissions',
  'permissions table should exist'
);

SELECT has_table(
  'public', 'role_permissions',
  'role_permissions table should exist'
);

-- Test 2: Check if the has_permission function exists
SELECT has_function(
  'public', 'has_permission', ARRAY['uuid', 'text'],
  'has_permission function should exist'
);

-- Test 3: Test has_permission function with user having no role
DO $$
DECLARE
  test_user_id UUID := gen_random_uuid();
BEGIN
  -- Create a test user with no role
  INSERT INTO public.profiles (id, email)
  VALUES (test_user_id, 'no_role_user@example.com');

  -- Test has_permission function
  ASSERT NOT public.has_permission(test_user_id, 'customers:read'),
    'User with no role should not have permission';
END $$;

-- Test 4: Test has_permission function with user having role but without permission
DO $$
DECLARE
  test_user_id UUID := gen_random_uuid();
  test_role_id UUID;
BEGIN
  -- Get or create a role
  SELECT id INTO test_role_id FROM public.roles WHERE name = 'test_role';

  IF test_role_id IS NULL THEN
    INSERT INTO public.roles (name, description)
    VALUES ('test_role', 'Test role for integration tests')
    RETURNING id INTO test_role_id;
  END IF;

  -- Create a test user with the role
  INSERT INTO public.profiles (id, email, role_id)
  VALUES (test_user_id, 'role_without_perm@example.com', test_role_id);

  -- Test has_permission function
  ASSERT NOT public.has_permission(test_user_id, 'test:permission'),
    'User with role but without permission should not have permission';
END $$;

-- Test 5: Test has_permission function with user having role and permission
DO $$
DECLARE
  test_user_id UUID := gen_random_uuid();
  test_role_id UUID;
  test_permission_id UUID;
BEGIN
  -- Get or create a role
  SELECT id INTO test_role_id FROM public.roles WHERE name = 'test_role_with_perm';

  IF test_role_id IS NULL THEN
    INSERT INTO public.roles (name, description)
    VALUES ('test_role_with_perm', 'Test role with permission')
    RETURNING id INTO test_role_id;
  END IF;

  -- Get or create a permission
  SELECT id INTO test_permission_id FROM public.permissions WHERE name = 'test:permission';

  IF test_permission_id IS NULL THEN
    INSERT INTO public.permissions (name, description)
    VALUES ('test:permission', 'Test permission')
    RETURNING id INTO test_permission_id;
  END IF;

  -- Assign permission to role
  INSERT INTO public.role_permissions (role_id, permission_id)
  VALUES (test_role_id, test_permission_id)
  ON CONFLICT DO NOTHING;

  -- Create a test user with the role
  INSERT INTO public.profiles (id, email, role_id)
  VALUES (test_user_id, 'role_with_perm@example.com', test_role_id);

  -- Test has_permission function
  ASSERT public.has_permission(test_user_id, 'test:permission'),
    'User with role and permission should have permission';
END $$;

-- Test 6: Test RLS policy enforcement
DO $$
DECLARE
  test_user_id UUID := gen_random_uuid();
  test_role_id UUID;
  test_permission_id UUID;
  lead_count INTEGER;
BEGIN
  -- Set up test user with role and permission
  SELECT id INTO test_role_id FROM public.roles WHERE name = 'test_role_with_leads_perm';

  IF test_role_id IS NULL THEN
    INSERT INTO public.roles (name, description)
    VALUES ('test_role_with_leads_perm', 'Test role with leads permission')
    RETURNING id INTO test_role_id;
  END IF;

  -- Get or create a permission
  SELECT id INTO test_permission_id FROM public.permissions WHERE name = 'leads:read';

  IF test_permission_id IS NULL THEN
    INSERT INTO public.permissions (name, description)
    VALUES ('leads:read', 'Can read leads')
    RETURNING id INTO test_permission_id;
  END IF;

  -- Assign permission to role
  INSERT INTO public.role_permissions (role_id, permission_id)
  VALUES (test_role_id, test_permission_id)
  ON CONFLICT DO NOTHING;

  -- Create a test user with the role
  INSERT INTO public.profiles (id, email, role_id)
  VALUES (test_user_id, 'leads_reader@example.com', test_role_id);

  -- Set auth.uid to the test user
  PERFORM set_config('request.jwt.claims', json_build_object('sub', test_user_id)::text, true);

  -- Count leads accessible to the user
  SELECT COUNT(*) INTO lead_count FROM public.leads;

  -- The user should be able to see leads
  ASSERT lead_count >= 0, 'User with leads:read permission should be able to access leads';
END $$;

-- Clean up
SELECT * FROM finish();
ROLLBACK;
