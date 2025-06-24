-- Test Audit Trigger Naming
-- This file tests that the audit triggers work correctly with the standardized naming convention

-- Setup test environment
BEGIN;

-- Clear request metadata to start fresh
SELECT public.clear_request_metadata();

-- Set test metadata
SELECT public.set_request_metadata('127.0.0.1', 'Test User Agent', '00000000-0000-0000-0000-000000000000');

-- Test customer creation
INSERT INTO public.customers (
  id,
  name,
  email,
  phone,
  address,
  city,
  state,
  zip,
  country,
  notes,
  created_by,
  updated_by
) VALUES (
  '10000000-0000-0000-0000-000000000001',
  'Test Customer',
  'test@example.com',
  '555-123-4567',
  '123 Test St',
  'Test City',
  'TS',
  '12345',
  'Test Country',
  'Test notes',
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000000'
);

-- Verify audit log was created for customer
SELECT
  COUNT(*) = 1 AS customer_create_logged,
  (SELECT action FROM public.activity_logs WHERE entity_id = '10000000-0000-0000-0000-000000000001'::uuid ORDER BY created_at DESC LIMIT 1) = 'INSERT' AS correct_action,
  (SELECT entity_type FROM public.activity_logs WHERE entity_id = '10000000-0000-0000-0000-000000000001'::uuid ORDER BY created_at DESC LIMIT 1) = 'customers' AS correct_entity_type,
  (SELECT ip_address FROM public.activity_logs WHERE entity_id = '10000000-0000-0000-0000-000000000001'::uuid ORDER BY created_at DESC LIMIT 1)::text = '127.0.0.1' AS correct_ip,
  (SELECT user_agent FROM public.activity_logs WHERE entity_id = '10000000-0000-0000-0000-000000000001'::uuid ORDER BY created_at DESC LIMIT 1) = 'Test User Agent' AS correct_user_agent;

-- Test customer update
UPDATE public.customers
SET
  name = 'Updated Test Customer',
  email = 'updated@example.com',
  updated_at = NOW()
WHERE id = '10000000-0000-0000-0000-000000000001';

-- Verify audit log was created for update
SELECT
  COUNT(*) >= 2 AS customer_update_logged,
  (SELECT action FROM public.activity_logs WHERE entity_id = '10000000-0000-0000-0000-000000000001'::uuid ORDER BY created_at DESC LIMIT 1) = 'UPDATE' AS correct_update_action,
  (SELECT changed_fields FROM public.activity_logs WHERE entity_id = '10000000-0000-0000-0000-000000000001'::uuid ORDER BY created_at DESC LIMIT 1) @> ARRAY['name', 'email', 'updated_at']::text[] AS correct_changed_fields;

-- Test customer deletion
DELETE FROM public.customers WHERE id = '10000000-0000-0000-0000-000000000001';

-- Verify audit log was created for deletion
SELECT
  COUNT(*) >= 3 AS customer_delete_logged,
  (SELECT action FROM public.activity_logs WHERE entity_id = '10000000-0000-0000-0000-000000000001'::uuid ORDER BY created_at DESC LIMIT 1) = 'DELETE' AS correct_delete_action;

-- Test lead with new trigger naming
INSERT INTO public.leads (
  id,
  name,
  email,
  phone,
  status,
  source,
  created_by,
  updated_by
) VALUES (
  '20000000-0000-0000-0000-000000000001',
  'Test Lead',
  'lead@example.com',
  '555-987-6543',
  'new',
  'website',
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000000'
);

-- Verify audit log was created for lead
SELECT
  COUNT(*) = 1 AS lead_create_logged,
  (SELECT action FROM public.activity_logs WHERE entity_id = '20000000-0000-0000-0000-000000000001'::uuid ORDER BY created_at DESC LIMIT 1) = 'INSERT' AS correct_action,
  (SELECT entity_type FROM public.activity_logs WHERE entity_id = '20000000-0000-0000-0000-000000000001'::uuid ORDER BY created_at DESC LIMIT 1) = 'leads' AS correct_entity_type;

-- Clean up
ROLLBACK;
