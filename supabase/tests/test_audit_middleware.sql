-- Test suite for audit logging middleware functions
BEGIN;

-- Load pgTAP
SELECT plan(7);

-- Test 1: Check if the set_request_metadata function exists
SELECT has_function(
  'public', 'set_request_metadata',
  'set_request_metadata function should exist'
);

-- Test 2: Check if the clear_request_metadata function exists
SELECT has_function(
  'public', 'clear_request_metadata',
  'clear_request_metadata function should exist'
);

-- Test 3: Check if the get_entity_audit_logs function exists
SELECT has_function(
  'public', 'get_entity_audit_logs',
  'get_entity_audit_logs function should exist'
);

-- Test 4: Check if the get_field_change_history function exists
SELECT has_function(
  'public', 'get_field_change_history',
  'get_field_change_history function should exist'
);

-- Test 5: Check if the get_user_activity function exists
SELECT has_function(
  'public', 'get_user_activity',
  'get_user_activity function should exist'
);

-- Test 6: Test setting and retrieving request metadata
DO $$
DECLARE
  test_ip TEXT := '192.168.1.100';
  test_ua TEXT := 'Test Browser';
  test_session TEXT := '00000000-0000-0000-0000-000000000010';
  result JSONB;
BEGIN
  -- Set up mock auth user
  PERFORM set_config('request.jwt.claims', '{"sub": "00000000-0000-0000-0000-000000000000"}', true);

  -- Set request metadata
  PERFORM public.set_request_metadata(test_ip, test_ua, test_session);

  -- Get request metadata
  result := public.get_request_metadata();

  -- Check if metadata was set correctly
  ASSERT (result ->> 'ip_address')::INET = test_ip::INET, 'IP address should be set correctly';
  ASSERT result ->> 'user_agent' = test_ua, 'User agent should be set correctly';
  ASSERT (result ->> 'session_id')::UUID = test_session::UUID, 'Session ID should be set correctly';

  -- Clear request metadata
  PERFORM public.clear_request_metadata();

  -- Get request metadata again
  result := public.get_request_metadata();

  -- Check if metadata was cleared
  -- Note: This might fail if request.headers are set, as it falls back to those
  -- This test assumes no request.headers are set in the test environment
  ASSERT (result ->> 'ip_address') IS NULL, 'IP address should be cleared';
  ASSERT (result ->> 'user_agent') IS NULL, 'User agent should be cleared';
  ASSERT (result ->> 'session_id') IS NULL, 'Session ID should be cleared';
END $$;

-- Test 7: Test entity audit logs retrieval
DO $$
DECLARE
  test_entity_id UUID := '00000000-0000-0000-0000-000000000001';
  test_entity_type TEXT := 'test_entity';
  log_id UUID;
  result RECORD;
BEGIN
  -- Set up mock auth user with necessary permissions
  PERFORM set_config('request.jwt.claims', '{"sub": "00000000-0000-0000-0000-000000000000"}', true);

  -- Mock the has_permission function to always return true for this test
  CREATE OR REPLACE FUNCTION public.has_permission(user_id UUID, permission_name TEXT)
  RETURNS BOOLEAN AS $$
    BEGIN RETURN TRUE; END;
  $$ LANGUAGE plpgsql;

  -- Create a test activity log
  INSERT INTO public.activity_logs (
    id,
    user_id,
    entity_type,
    entity_id,
    action,
    description,
    old_data,
    new_data,
    changed_fields,
    created_at
  ) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    test_entity_type,
    test_entity_id,
    'test_action',
    'Test description',
    jsonb_build_object('field1', 'old_value'),
    jsonb_build_object('field1', 'new_value'),
    ARRAY['field1'],
    now()
  ) RETURNING id INTO log_id;

  -- Test get_entity_audit_logs
  FOR result IN SELECT * FROM public.get_entity_audit_logs(test_entity_type, test_entity_id) LIMIT 1
  LOOP
    ASSERT result.id = log_id, 'get_entity_audit_logs should return the correct log';
    ASSERT result.entity_type = test_entity_type, 'get_entity_audit_logs should return the correct entity_type';
    ASSERT result.entity_id = test_entity_id, 'get_entity_audit_logs should return the correct entity_id';
    ASSERT result.action = 'test_action', 'get_entity_audit_logs should return the correct action';
  END LOOP;

  -- Test get_field_change_history
  FOR result IN SELECT * FROM public.get_field_change_history(test_entity_type, test_entity_id, 'field1') LIMIT 1
  LOOP
    ASSERT result.log_id = log_id, 'get_field_change_history should return the correct log';
    ASSERT result.old_value = '"old_value"'::jsonb, 'get_field_change_history should return the correct old_value';
    ASSERT result.new_value = '"new_value"'::jsonb, 'get_field_change_history should return the correct new_value';
  END LOOP;

  -- Test get_user_activity
  FOR result IN SELECT * FROM public.get_user_activity('00000000-0000-0000-0000-000000000000') LIMIT 1
  LOOP
    ASSERT result.id = log_id, 'get_user_activity should return the correct log';
    ASSERT result.entity_type = test_entity_type, 'get_user_activity should return the correct entity_type';
    ASSERT result.entity_id = test_entity_id, 'get_user_activity should return the correct entity_id';
    ASSERT result.action = 'test_action', 'get_user_activity should return the correct action';
  END LOOP;

  -- Restore the original has_permission function
  DROP FUNCTION IF EXISTS public.has_permission(UUID, TEXT);
END $$;

-- Finish the tests and clean up
SELECT * FROM finish();
ROLLBACK;
