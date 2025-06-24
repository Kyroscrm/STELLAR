-- Test suite for audit logging functionality
BEGIN;

-- Load pgTAP
SELECT plan(12);

-- Test 1: Check if activity_logs table has the new columns
SELECT has_column(
  'public', 'activity_logs', 'old_data',
  'activity_logs table should have old_data column'
);

SELECT has_column(
  'public', 'activity_logs', 'new_data',
  'activity_logs table should have new_data column'
);

SELECT has_column(
  'public', 'activity_logs', 'changed_fields',
  'activity_logs table should have changed_fields column'
);

SELECT has_column(
  'public', 'activity_logs', 'ip_address',
  'activity_logs table should have ip_address column'
);

SELECT has_column(
  'public', 'activity_logs', 'user_agent',
  'activity_logs table should have user_agent column'
);

SELECT has_column(
  'public', 'activity_logs', 'session_id',
  'activity_logs table should have session_id column'
);

-- Test 2: Check if user_sessions table exists with required columns
SELECT has_table(
  'public', 'user_sessions',
  'user_sessions table should exist'
);

SELECT has_column(
  'public', 'user_sessions', 'user_id',
  'user_sessions table should have user_id column'
);

SELECT has_column(
  'public', 'user_sessions', 'login_time',
  'user_sessions table should have login_time column'
);

SELECT has_column(
  'public', 'user_sessions', 'logout_time',
  'user_sessions table should have logout_time column'
);

-- Test 3: Test log_activity function with new parameters
DO $$
DECLARE
  log_id UUID;
BEGIN
  -- Set up mock auth user
  PERFORM set_config('request.jwt.claims', '{"sub": "00000000-0000-0000-0000-000000000000"}', true);

  -- Call the function with new parameters
  SELECT public.log_activity(
    'test_action',
    'test_entity',
    '00000000-0000-0000-0000-000000000001'::UUID,
    'Test description',
    jsonb_build_object('test_key', 'test_value'),
    jsonb_build_object('old_field', 'old_value'),
    jsonb_build_object('new_field', 'new_value'),
    ARRAY['changed_field1', 'changed_field2'],
    '127.0.0.1'::INET,
    'Test User Agent',
    '00000000-0000-0000-0000-000000000002'::UUID,
    'high',
    7
  ) INTO log_id;

  -- Check if the log was created with the correct values
  ASSERT log_id IS NOT NULL, 'log_activity should return a UUID';
END $$;

-- Test if the log was created with all the new fields
SELECT results_eq(
  $$
    SELECT
      action = 'test_action' AND
      entity_type = 'test_entity' AND
      entity_id = '00000000-0000-0000-0000-000000000001'::UUID AND
      description = 'Test description' AND
      old_data = jsonb_build_object('old_field', 'old_value') AND
      new_data = jsonb_build_object('new_field', 'new_value') AND
      changed_fields = ARRAY['changed_field1', 'changed_field2'] AND
      ip_address = '127.0.0.1'::INET AND
      user_agent = 'Test User Agent' AND
      session_id = '00000000-0000-0000-0000-000000000002'::UUID AND
      compliance_level = 'high' AND
      risk_score = 7
    FROM public.activity_logs
    WHERE action = 'test_action'
    ORDER BY created_at DESC
    LIMIT 1
  $$,
  ARRAY[true],
  'log_activity should store all the new fields correctly'
);

-- Test 4: Test the get_changed_fields function
SELECT is(
  public.get_changed_fields(
    jsonb_build_object('field1', 'value1', 'field2', 'value2'),
    jsonb_build_object('field1', 'value1', 'field2', 'changed', 'field3', 'new')
  ),
  ARRAY['field2', 'field3'],
  'get_changed_fields should correctly identify changed and new fields'
);

-- Test 5: Test the trigger function by inserting a new customer
DO $$
DECLARE
  customer_id UUID;
  log_count INTEGER;
BEGIN
  -- Set up mock auth user and headers
  PERFORM set_config('request.jwt.claims', '{"sub": "00000000-0000-0000-0000-000000000000"}', true);
  PERFORM set_config('request.headers', '{"x-forwarded-for": "192.168.1.1", "user-agent": "Test Browser", "x-session-id": "00000000-0000-0000-0000-000000000003"}', true);

  -- Insert a new customer
  INSERT INTO public.customers (
    name,
    email,
    phone,
    address,
    created_by
  ) VALUES (
    'Test Customer',
    'test@example.com',
    '123-456-7890',
    '123 Test St',
    '00000000-0000-0000-0000-000000000000'
  ) RETURNING id INTO customer_id;

  -- Check if an activity log was created
  SELECT COUNT(*) INTO log_count
  FROM public.activity_logs
  WHERE entity_id = customer_id AND action = 'created' AND entity_type = 'customers';

  ASSERT log_count = 1, 'An activity log should be created for new customer';
END $$;

-- Test 6: Test the trigger function by updating a customer
DO $$
DECLARE
  customer_id UUID;
  log_count INTEGER;
BEGIN
  -- Get the customer we just created
  SELECT id INTO customer_id
  FROM public.customers
  WHERE email = 'test@example.com';

  -- Set up mock auth user and headers
  PERFORM set_config('request.jwt.claims', '{"sub": "00000000-0000-0000-0000-000000000000"}', true);
  PERFORM set_config('request.headers', '{"x-forwarded-for": "192.168.1.2", "user-agent": "Test Browser 2", "x-session-id": "00000000-0000-0000-0000-000000000004"}', true);

  -- Update the customer
  UPDATE public.customers
  SET name = 'Updated Test Customer',
      phone = '987-654-3210'
  WHERE id = customer_id;

  -- Check if an activity log was created for the update
  SELECT COUNT(*) INTO log_count
  FROM public.activity_logs
  WHERE entity_id = customer_id AND action = 'updated' AND entity_type = 'customers'
  AND changed_fields @> ARRAY['name', 'phone'];

  ASSERT log_count = 1, 'An activity log should be created for customer update with correct changed_fields';
END $$;

-- Test 7: Test the trigger function by deleting a customer
DO $$
DECLARE
  customer_id UUID;
  log_count INTEGER;
BEGIN
  -- Get the customer we just updated
  SELECT id INTO customer_id
  FROM public.customers
  WHERE email = 'test@example.com';

  -- Set up mock auth user and headers
  PERFORM set_config('request.jwt.claims', '{"sub": "00000000-0000-0000-0000-000000000000"}', true);
  PERFORM set_config('request.headers', '{"x-forwarded-for": "192.168.1.3", "user-agent": "Test Browser 3", "x-session-id": "00000000-0000-0000-0000-000000000005"}', true);

  -- Delete the customer
  DELETE FROM public.customers
  WHERE id = customer_id;

  -- Check if an activity log was created for the delete
  SELECT COUNT(*) INTO log_count
  FROM public.activity_logs
  WHERE entity_id = customer_id AND action = 'deleted' AND entity_type = 'customers';

  ASSERT log_count = 1, 'An activity log should be created for customer deletion';
END $$;

-- Test 8: Test the session management functions
DO $$
DECLARE
  session_id UUID;
  session_ended BOOLEAN;
BEGIN
  -- Set up mock auth user
  PERFORM set_config('request.jwt.claims', '{"sub": "00000000-0000-0000-0000-000000000000"}', true);

  -- Start a new session
  SELECT public.start_user_session(
    '00000000-0000-0000-0000-000000000000'::UUID,
    '192.168.1.4'::INET,
    'Test Session Browser',
    jsonb_build_object('device', 'desktop', 'os', 'windows'),
    jsonb_build_object('country', 'US', 'city', 'Test City')
  ) INTO session_id;

  ASSERT session_id IS NOT NULL, 'start_user_session should return a session ID';

  -- Update session activity
  PERFORM public.update_session_activity(session_id);

  -- End the session
  SELECT public.end_user_session(session_id) INTO session_ended;

  ASSERT session_ended = TRUE, 'end_user_session should return TRUE for successful session end';
END $$;

-- Finish the tests and clean up
SELECT * FROM finish();
ROLLBACK;
