-- Integration tests for audit logging functionality
BEGIN;

-- Load pgTAP
SELECT plan(8);

-- Test 1: Check if get_changed_fields function exists
SELECT has_function(
  'public', 'get_changed_fields', ARRAY['jsonb', 'jsonb'],
  'get_changed_fields function should exist'
);

-- Test 2: Test get_changed_fields function
SELECT is(
  public.get_changed_fields(
    jsonb_build_object('field1', 'value1', 'field2', 'value2', 'field3', 'value3'),
    jsonb_build_object('field1', 'value1', 'field2', 'changed', 'field4', 'new')
  ),
  ARRAY['field2', 'field3', 'field4'],
  'get_changed_fields should correctly identify changed and new fields'
);

-- Test 3: Check if get_request_metadata function exists
SELECT has_function(
  'public', 'get_request_metadata',
  'get_request_metadata function should exist'
);

-- Test 4: Test get_request_metadata function
DO $$
BEGIN
  -- Set up mock request headers
  PERFORM set_config('request.headers',
    '{"x-forwarded-for": "192.168.1.1", "user-agent": "Test Browser", "x-session-id": "00000000-0000-0000-0000-000000000001"}',
    true);

  -- Test the function returns expected values
  ASSERT (public.get_request_metadata()).ip_address = '192.168.1.1'::inet,
    'get_request_metadata should return correct IP address';
  ASSERT (public.get_request_metadata()).user_agent = 'Test Browser',
    'get_request_metadata should return correct user agent';
  ASSERT (public.get_request_metadata()).session_id = '00000000-0000-0000-0000-000000000001'::uuid,
    'get_request_metadata should return correct session ID';
END $$;

-- Test 5: Test audit trigger for INSERT
DO $$
DECLARE
  test_user_id UUID := gen_random_uuid();
  test_customer_id UUID;
  log_count INTEGER;
  log_record RECORD;
BEGIN
  -- Set up mock auth user and headers
  PERFORM set_config('request.jwt.claims', json_build_object('sub', test_user_id)::text, true);
  PERFORM set_config('request.headers',
    '{"x-forwarded-for": "192.168.1.2", "user-agent": "Test Browser Insert", "x-session-id": "00000000-0000-0000-0000-000000000002"}',
    true);

  -- Insert a test customer
  INSERT INTO public.customers (
    name,
    email,
    phone,
    address,
    created_by
  ) VALUES (
    'Test Customer',
    'test_audit@example.com',
    '123-456-7890',
    '123 Test St',
    test_user_id
  ) RETURNING id INTO test_customer_id;

  -- Check if an activity log was created
  SELECT COUNT(*) INTO log_count
  FROM public.activity_logs
  WHERE entity_id = test_customer_id AND action = 'created' AND entity_type = 'customers';

  -- Get the log record
  SELECT * INTO log_record
  FROM public.activity_logs
  WHERE entity_id = test_customer_id AND action = 'created' AND entity_type = 'customers'
  LIMIT 1;

  -- Verify log count
  ASSERT log_count = 1, 'An activity log should be created for new customer';

  -- Verify log fields
  ASSERT log_record.user_id = test_user_id, 'Log should have correct user_id';
  ASSERT log_record.old_data IS NULL, 'old_data should be NULL for INSERT';
  ASSERT log_record.new_data IS NOT NULL, 'new_data should not be NULL for INSERT';
  ASSERT log_record.ip_address = '192.168.1.2'::inet, 'Log should have correct IP address';
  ASSERT log_record.user_agent = 'Test Browser Insert', 'Log should have correct user agent';
END $$;

-- Test 6: Test audit trigger for UPDATE
DO $$
DECLARE
  test_user_id UUID := gen_random_uuid();
  test_customer_id UUID;
  log_count INTEGER;
  log_record RECORD;
BEGIN
  -- Create a test customer
  INSERT INTO public.customers (
    name,
    email,
    phone,
    address,
    created_by
  ) VALUES (
    'Update Test Customer',
    'update_test@example.com',
    '123-456-7890',
    '123 Test St',
    test_user_id
  ) RETURNING id INTO test_customer_id;

  -- Set up mock auth user and headers for update
  PERFORM set_config('request.jwt.claims', json_build_object('sub', test_user_id)::text, true);
  PERFORM set_config('request.headers',
    '{"x-forwarded-for": "192.168.1.3", "user-agent": "Test Browser Update", "x-session-id": "00000000-0000-0000-0000-000000000003"}',
    true);

  -- Update the customer
  UPDATE public.customers
  SET name = 'Updated Customer Name',
      phone = '987-654-3210'
  WHERE id = test_customer_id;

  -- Check if an activity log was created for the update
  SELECT COUNT(*) INTO log_count
  FROM public.activity_logs
  WHERE entity_id = test_customer_id AND action = 'updated' AND entity_type = 'customers';

  -- Get the log record
  SELECT * INTO log_record
  FROM public.activity_logs
  WHERE entity_id = test_customer_id AND action = 'updated' AND entity_type = 'customers'
  LIMIT 1;

  -- Verify log count
  ASSERT log_count = 1, 'An activity log should be created for customer update';

  -- Verify log fields
  ASSERT log_record.user_id = test_user_id, 'Log should have correct user_id';
  ASSERT log_record.old_data IS NOT NULL, 'old_data should not be NULL for UPDATE';
  ASSERT log_record.new_data IS NOT NULL, 'new_data should not be NULL for UPDATE';
  ASSERT log_record.changed_fields @> ARRAY['name', 'phone'], 'changed_fields should contain updated fields';
  ASSERT log_record.ip_address = '192.168.1.3'::inet, 'Log should have correct IP address';
  ASSERT log_record.user_agent = 'Test Browser Update', 'Log should have correct user agent';
END $$;

-- Test 7: Test audit trigger for DELETE
DO $$
DECLARE
  test_user_id UUID := gen_random_uuid();
  test_customer_id UUID;
  log_count INTEGER;
  log_record RECORD;
BEGIN
  -- Create a test customer
  INSERT INTO public.customers (
    name,
    email,
    phone,
    address,
    created_by
  ) VALUES (
    'Delete Test Customer',
    'delete_test@example.com',
    '123-456-7890',
    '123 Test St',
    test_user_id
  ) RETURNING id INTO test_customer_id;

  -- Set up mock auth user and headers for delete
  PERFORM set_config('request.jwt.claims', json_build_object('sub', test_user_id)::text, true);
  PERFORM set_config('request.headers',
    '{"x-forwarded-for": "192.168.1.4", "user-agent": "Test Browser Delete", "x-session-id": "00000000-0000-0000-0000-000000000004"}',
    true);

  -- Delete the customer
  DELETE FROM public.customers
  WHERE id = test_customer_id;

  -- Check if an activity log was created for the delete
  SELECT COUNT(*) INTO log_count
  FROM public.activity_logs
  WHERE entity_id = test_customer_id AND action = 'deleted' AND entity_type = 'customers';

  -- Get the log record
  SELECT * INTO log_record
  FROM public.activity_logs
  WHERE entity_id = test_customer_id AND action = 'deleted' AND entity_type = 'customers'
  LIMIT 1;

  -- Verify log count
  ASSERT log_count = 1, 'An activity log should be created for customer delete';

  -- Verify log fields
  ASSERT log_record.user_id = test_user_id, 'Log should have correct user_id';
  ASSERT log_record.old_data IS NOT NULL, 'old_data should not be NULL for DELETE';
  ASSERT log_record.new_data IS NULL, 'new_data should be NULL for DELETE';
  ASSERT log_record.ip_address = '192.168.1.4'::inet, 'Log should have correct IP address';
  ASSERT log_record.user_agent = 'Test Browser Delete', 'Log should have correct user agent';
END $$;

-- Test 8: Test set_request_metadata and clear_request_metadata functions
DO $$
BEGIN
  -- Test set_request_metadata
  ASSERT public.set_request_metadata('192.168.1.5', 'Test Browser Set', '00000000-0000-0000-0000-000000000005'),
    'set_request_metadata should return true';

  -- Verify metadata was set
  ASSERT (public.get_request_metadata()).ip_address = '192.168.1.5'::inet,
    'get_request_metadata should return set IP address';
  ASSERT (public.get_request_metadata()).user_agent = 'Test Browser Set',
    'get_request_metadata should return set user agent';
  ASSERT (public.get_request_metadata()).session_id = '00000000-0000-0000-0000-000000000005'::uuid,
    'get_request_metadata should return set session ID';

  -- Test clear_request_metadata
  ASSERT public.clear_request_metadata(),
    'clear_request_metadata should return true';

  -- Verify metadata was cleared
  ASSERT (public.get_request_metadata()).ip_address IS NULL,
    'IP address should be NULL after clear';
  ASSERT (public.get_request_metadata()).user_agent IS NULL,
    'User agent should be NULL after clear';
  ASSERT (public.get_request_metadata()).session_id IS NULL,
    'Session ID should be NULL after clear';
END $$;

-- Clean up
SELECT * FROM finish();
ROLLBACK;
