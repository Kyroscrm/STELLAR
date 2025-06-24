-- Performance Tests: Verify that indexes and materialized views improve query performance
-- This test file uses pgTAP to verify that our performance optimizations are working correctly

BEGIN;

-- Load pgTAP if available (this is for local testing, may not work in all environments)
-- \i pgtap.sql

-- Create a temp user for testing
DO $$
DECLARE
  test_user_id UUID := '11111111-1111-1111-1111-111111111111';
BEGIN
  -- Insert test user if not exists
  INSERT INTO auth.users (id, email)
  VALUES (test_user_id, 'test-performance@example.com')
  ON CONFLICT (id) DO NOTHING;

  -- Insert profile if not exists
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (test_user_id, 'Test Performance User', 'test-performance@example.com')
  ON CONFLICT (id) DO NOTHING;
END $$;

-- Set up test data if needed
DO $$
DECLARE
  test_user_id UUID := '11111111-1111-1111-1111-111111111111';
  customer_id UUID;
  lead_id UUID;
  estimate_id UUID;
  invoice_id UUID;
BEGIN
  -- Create test customer
  INSERT INTO public.customers (id, user_id, full_name, email, status)
  VALUES (gen_random_uuid(), test_user_id, 'Test Customer', 'customer@example.com', 'active')
  RETURNING id INTO customer_id;

  -- Create test lead
  INSERT INTO public.leads (id, user_id, full_name, email, status, estimated_value)
  VALUES (gen_random_uuid(), test_user_id, 'Test Lead', 'lead@example.com', 'new', 1000)
  RETURNING id INTO lead_id;

  -- Create test estimate
  INSERT INTO public.estimates (id, user_id, customer_id, status, total_amount)
  VALUES (gen_random_uuid(), test_user_id, customer_id, 'draft', 1500)
  RETURNING id INTO estimate_id;

  -- Create test invoice
  INSERT INTO public.invoices (id, user_id, customer_id, status, total_amount, due_date)
  VALUES (gen_random_uuid(), test_user_id, customer_id, 'pending', 1500, now() + interval '30 days')
  RETURNING id INTO invoice_id;

  -- Create some activity logs
  FOR i IN 1..10 LOOP
    INSERT INTO public.activity_logs (id, user_id, action, entity_type, entity_id, description)
    VALUES (
      gen_random_uuid(),
      test_user_id,
      (CASE WHEN i % 3 = 0 THEN 'create' WHEN i % 3 = 1 THEN 'update' ELSE 'view' END),
      (CASE WHEN i % 4 = 0 THEN 'customer' WHEN i % 4 = 1 THEN 'lead' WHEN i % 4 = 2 THEN 'estimate' ELSE 'invoice' END),
      (CASE
        WHEN i % 4 = 0 THEN customer_id
        WHEN i % 4 = 1 THEN lead_id
        WHEN i % 4 = 2 THEN estimate_id
        ELSE invoice_id
      END),
      'Test activity log ' || i
    );
  END LOOP;
END $$;

-- Test 1: Verify that indexes improve query performance
DO $$
DECLARE
  test_user_id UUID := '11111111-1111-1111-1111-111111111111';
  query_plan JSONB;
  index_used BOOLEAN;
BEGIN
  -- Test the leads status index
  EXPLAIN (FORMAT JSON)
  SELECT * FROM public.leads
  WHERE user_id = test_user_id AND status = 'new'
  INTO query_plan;

  -- Extract if index was used
  index_used := query_plan->0->'Plan'->'Plans'->0->'Index Name' LIKE 'idx_leads_status_user_id%';

  -- Raise notice with the result
  IF index_used THEN
    RAISE NOTICE 'PASS: Index idx_leads_status_user_id is being used';
  ELSE
    RAISE NOTICE 'FAIL: Index idx_leads_status_user_id is NOT being used';
    -- Uncomment to see the query plan
    -- RAISE NOTICE 'Query plan: %', query_plan;
  END IF;

  -- Test the invoices due_date index
  EXPLAIN (FORMAT JSON)
  SELECT * FROM public.invoices
  WHERE user_id = test_user_id AND due_date > now()
  INTO query_plan;

  -- Extract if index was used
  index_used := query_plan->0->'Plan'->'Plans'->0->'Index Name' LIKE 'idx_invoices_due_date_user_id%';

  -- Raise notice with the result
  IF index_used THEN
    RAISE NOTICE 'PASS: Index idx_invoices_due_date_user_id is being used';
  ELSE
    RAISE NOTICE 'FAIL: Index idx_invoices_due_date_user_id is NOT being used';
    -- Uncomment to see the query plan
    -- RAISE NOTICE 'Query plan: %', query_plan;
  END IF;

  -- Test the activity_logs created_at index
  EXPLAIN (FORMAT JSON)
  SELECT * FROM public.activity_logs
  WHERE user_id = test_user_id
  ORDER BY created_at DESC
  LIMIT 10
  INTO query_plan;

  -- Extract if index was used
  index_used := query_plan->0->'Plan'->'Plans'->0->'Index Name' LIKE 'idx_activity_logs_created_at_user_id%';

  -- Raise notice with the result
  IF index_used THEN
    RAISE NOTICE 'PASS: Index idx_activity_logs_created_at_user_id is being used';
  ELSE
    RAISE NOTICE 'FAIL: Index idx_activity_logs_created_at_user_id is NOT being used';
    -- Uncomment to see the query plan
    -- RAISE NOTICE 'Query plan: %', query_plan;
  END IF;
END $$;

-- Test 2: Verify that materialized views contain the correct data
DO $$
DECLARE
  test_user_id UUID := '11111111-1111-1111-1111-111111111111';
  mv_count INTEGER;
  actual_count INTEGER;
BEGIN
  -- Refresh the materialized views first
  PERFORM public.refresh_materialized_views();

  -- Test the dashboard summary materialized view
  SELECT COUNT(*) FROM public.mv_dashboard_summary
  WHERE user_id = test_user_id
  INTO mv_count;

  -- Raise notice with the result
  IF mv_count > 0 THEN
    RAISE NOTICE 'PASS: Materialized view mv_dashboard_summary contains data for test user';
  ELSE
    RAISE NOTICE 'FAIL: Materialized view mv_dashboard_summary does not contain data for test user';
  END IF;

  -- Test the lead conversion metrics materialized view
  SELECT COUNT(*) FROM public.mv_lead_conversion_metrics
  WHERE user_id = test_user_id
  INTO mv_count;

  -- Raise notice with the result
  IF mv_count > 0 THEN
    RAISE NOTICE 'PASS: Materialized view mv_lead_conversion_metrics contains data for test user';
  ELSE
    RAISE NOTICE 'FAIL: Materialized view mv_lead_conversion_metrics does not contain data for test user';
  END IF;

  -- Test the monthly revenue materialized view
  SELECT COUNT(*) FROM public.mv_monthly_revenue
  WHERE user_id = test_user_id
  INTO mv_count;

  -- Raise notice with the result
  IF mv_count > 0 THEN
    RAISE NOTICE 'PASS: Materialized view mv_monthly_revenue contains data for test user';
  ELSE
    RAISE NOTICE 'FAIL: Materialized view mv_monthly_revenue does not contain data for test user';
  END IF;
END $$;

-- Test 3: Verify that the refresh functions work correctly
DO $$
DECLARE
  result JSON;
BEGIN
  -- Test the scheduled refresh function
  SELECT public.scheduled_refresh_materialized_views() INTO result;

  -- Raise notice with the result
  IF (result->>'success')::BOOLEAN THEN
    RAISE NOTICE 'PASS: scheduled_refresh_materialized_views function executed successfully';
  ELSE
    RAISE NOTICE 'FAIL: scheduled_refresh_materialized_views function failed: %', result->>'error';
  END IF;

  -- Test the specific refresh function
  SELECT public.refresh_specific_materialized_view('mv_dashboard_summary') INTO result;

  -- Raise notice with the result
  IF (result->>'success')::BOOLEAN THEN
    RAISE NOTICE 'PASS: refresh_specific_materialized_view function executed successfully';
  ELSE
    RAISE NOTICE 'FAIL: refresh_specific_materialized_view function failed: %', result->>'error';
  END IF;
END $$;

-- Clean up test data (comment out if you want to keep the test data)
/*
DO $$
DECLARE
  test_user_id UUID := '11111111-1111-1111-1111-111111111111';
BEGIN
  -- Delete test data
  DELETE FROM public.activity_logs WHERE user_id = test_user_id;
  DELETE FROM public.invoices WHERE user_id = test_user_id;
  DELETE FROM public.estimates WHERE user_id = test_user_id;
  DELETE FROM public.leads WHERE user_id = test_user_id;
  DELETE FROM public.customers WHERE user_id = test_user_id;
  DELETE FROM public.profiles WHERE id = test_user_id;
  DELETE FROM auth.users WHERE id = test_user_id;
END $$;
*/

ROLLBACK;
