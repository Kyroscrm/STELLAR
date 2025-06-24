-- Integration tests for RLS policy enforcement
BEGIN;

-- Load pgTAP
SELECT plan(6);

-- Test 1: Check if RLS is enabled on critical tables
SELECT row_security_active('public', 'customers'),
  'Row security should be active on customers table';
SELECT row_security_active('public', 'leads'),
  'Row security should be active on leads table';
SELECT row_security_active('public', 'estimates'),
  'Row security should be active on estimates table';
SELECT row_security_active('public', 'invoices'),
  'Row security should be active on invoices table';
SELECT row_security_active('public', 'jobs'),
  'Row security should be active on jobs table';
SELECT row_security_active('public', 'tasks'),
  'Row security should be active on tasks table';

-- Test 2: Test RLS policy enforcement for leads table
DO $$
DECLARE
  test_user_id UUID := gen_random_uuid();
  test_role_id UUID;
  test_permission_id UUID;
  test_lead_id UUID;
  lead_count INTEGER;
BEGIN
  -- Create a test role without leads permission
  INSERT INTO public.roles (name, description)
  VALUES ('test_role_no_leads_perm', 'Test role without leads permission')
  RETURNING id INTO test_role_id;

  -- Create a test user with the role
  INSERT INTO public.profiles (id, email, role_id)
  VALUES (test_user_id, 'no_leads_perm@example.com', test_role_id);

  -- Create a test lead
  INSERT INTO public.leads (
    name,
    email,
    phone,
    status,
    source,
    created_by
  ) VALUES (
    'Test Lead',
    'test_lead@example.com',
    '123-456-7890',
    'new',
    'website',
    test_user_id
  ) RETURNING id INTO test_lead_id;

  -- Set auth.uid to the test user
  PERFORM set_config('request.jwt.claims', json_build_object('sub', test_user_id)::text, true);

  -- Attempt to select leads - should be restricted by RLS
  BEGIN
    SELECT COUNT(*) INTO lead_count FROM public.leads;
    -- If we get here, RLS didn't block the query
    ASSERT lead_count = 0, 'User without leads:read permission should not see any leads';
  EXCEPTION
    WHEN insufficient_privilege THEN
      -- This is expected - RLS blocked the query
      lead_count := 0;
  END;

  -- Now add leads:read permission to the role
  INSERT INTO public.permissions (name, description)
  VALUES ('leads:read', 'Can read leads')
  RETURNING id INTO test_permission_id;

  INSERT INTO public.role_permissions (role_id, permission_id)
  VALUES (test_role_id, test_permission_id);

  -- Try again - should now be able to see leads
  BEGIN
    SELECT COUNT(*) INTO lead_count FROM public.leads;
    -- If we get here, RLS allowed the query
    ASSERT lead_count > 0, 'User with leads:read permission should see leads';
  EXCEPTION
    WHEN insufficient_privilege THEN
      -- This is unexpected - RLS blocked the query
      ASSERT FALSE, 'User with leads:read permission should not be blocked';
  END;
END $$;

-- Test 3: Test RLS policy enforcement for customers table
DO $$
DECLARE
  test_user_id UUID := gen_random_uuid();
  test_role_id UUID;
  test_permission_id UUID;
  test_customer_id UUID;
BEGIN
  -- Create a test role without customers permission
  INSERT INTO public.roles (name, description)
  VALUES ('test_role_no_customers_perm', 'Test role without customers permission')
  RETURNING id INTO test_role_id;

  -- Create a test user with the role
  INSERT INTO public.profiles (id, email, role_id)
  VALUES (test_user_id, 'no_customers_perm@example.com', test_role_id);

  -- Set auth.uid to the test user
  PERFORM set_config('request.jwt.claims', json_build_object('sub', test_user_id)::text, true);

  -- Attempt to insert a customer - should be restricted by RLS
  BEGIN
    INSERT INTO public.customers (
      name,
      email,
      phone,
      address,
      created_by
    ) VALUES (
      'Test RLS Customer',
      'test_rls@example.com',
      '123-456-7890',
      '123 Test St',
      test_user_id
    ) RETURNING id INTO test_customer_id;

    -- If we get here, RLS didn't block the insert
    ASSERT FALSE, 'User without customers:create permission should not be able to insert customers';
  EXCEPTION
    WHEN insufficient_privilege THEN
      -- This is expected - RLS blocked the insert
      test_customer_id := NULL;
  END;

  -- Now add customers:create permission to the role
  INSERT INTO public.permissions (name, description)
  VALUES ('customers:create', 'Can create customers')
  RETURNING id INTO test_permission_id;

  INSERT INTO public.role_permissions (role_id, permission_id)
  VALUES (test_role_id, test_permission_id);

  -- Try again - should now be able to insert a customer
  BEGIN
    INSERT INTO public.customers (
      name,
      email,
      phone,
      address,
      created_by
    ) VALUES (
      'Test RLS Customer',
      'test_rls@example.com',
      '123-456-7890',
      '123 Test St',
      test_user_id
    ) RETURNING id INTO test_customer_id;

    -- If we get here, RLS allowed the insert
    ASSERT test_customer_id IS NOT NULL, 'User with customers:create permission should be able to insert customers';
  EXCEPTION
    WHEN insufficient_privilege THEN
      -- This is unexpected - RLS blocked the insert
      ASSERT FALSE, 'User with customers:create permission should not be blocked';
  END;
END $$;

-- Test 4: Test RLS policy enforcement for estimates table
DO $$
DECLARE
  test_user_id UUID := gen_random_uuid();
  test_role_id UUID;
  test_permission_id UUID;
  test_customer_id UUID;
  test_estimate_id UUID;
BEGIN
  -- Create a test role without estimates permission
  INSERT INTO public.roles (name, description)
  VALUES ('test_role_no_estimates_perm', 'Test role without estimates permission')
  RETURNING id INTO test_role_id;

  -- Create a test user with the role
  INSERT INTO public.profiles (id, email, role_id)
  VALUES (test_user_id, 'no_estimates_perm@example.com', test_role_id);

  -- Create a test customer (bypassing RLS for setup)
  INSERT INTO public.customers (
    name,
    email,
    phone,
    address,
    created_by
  ) VALUES (
    'Estimate Test Customer',
    'estimate_test@example.com',
    '123-456-7890',
    '123 Test St',
    test_user_id
  ) RETURNING id INTO test_customer_id;

  -- Set auth.uid to the test user
  PERFORM set_config('request.jwt.claims', json_build_object('sub', test_user_id)::text, true);

  -- Attempt to insert an estimate - should be restricted by RLS
  BEGIN
    INSERT INTO public.estimates (
      customer_id,
      total_amount,
      status,
      created_by
    ) VALUES (
      test_customer_id,
      1000,
      'draft',
      test_user_id
    ) RETURNING id INTO test_estimate_id;

    -- If we get here, RLS didn't block the insert
    ASSERT FALSE, 'User without estimates:create permission should not be able to insert estimates';
  EXCEPTION
    WHEN insufficient_privilege THEN
      -- This is expected - RLS blocked the insert
      test_estimate_id := NULL;
  END;

  -- Now add estimates:create permission to the role
  INSERT INTO public.permissions (name, description)
  VALUES ('estimates:create', 'Can create estimates')
  RETURNING id INTO test_permission_id;

  INSERT INTO public.role_permissions (role_id, permission_id)
  VALUES (test_role_id, test_permission_id);

  -- Try again - should now be able to insert an estimate
  BEGIN
    INSERT INTO public.estimates (
      customer_id,
      total_amount,
      status,
      created_by
    ) VALUES (
      test_customer_id,
      1000,
      'draft',
      test_user_id
    ) RETURNING id INTO test_estimate_id;

    -- If we get here, RLS allowed the insert
    ASSERT test_estimate_id IS NOT NULL, 'User with estimates:create permission should be able to insert estimates';
  EXCEPTION
    WHEN insufficient_privilege THEN
      -- This is unexpected - RLS blocked the insert
      ASSERT FALSE, 'User with estimates:create permission should not be blocked';
  END;
END $$;

-- Clean up
SELECT * FROM finish();
ROLLBACK;
