-- Performance Optimization: Add scheduled refresh for materialized views
-- This migration adds a scheduled job to refresh materialized views nightly

-- ==========================================
-- PHASE 1: CREATE SCHEDULED REFRESH JOB
-- ==========================================

-- Create an extension for pg_cron if it doesn't exist
-- Note: This requires pg_cron to be available in the database
-- For Supabase, this would typically be configured via the Supabase dashboard
-- or using the appropriate Supabase API
-- This is commented out as it depends on the hosting environment
-- CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Instead, we'll create a function that can be called via a Supabase Edge Function
-- or external cron job

-- Create a function to refresh all materialized views with proper error handling
CREATE OR REPLACE FUNCTION public.scheduled_refresh_materialized_views()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  start_time TIMESTAMPTZ;
  end_time TIMESTAMPTZ;
  refresh_result JSON;
  success BOOLEAN := TRUE;
  error_message TEXT;
BEGIN
  start_time := now();

  BEGIN
    -- Refresh all materialized views
    PERFORM public.refresh_materialized_views();

    -- Log the successful refresh
    INSERT INTO public.activity_logs (
      user_id,
      action,
      entity_type,
      entity_id,
      description,
      metadata
    ) VALUES (
      '00000000-0000-0000-0000-000000000000', -- System user ID
      'refresh',
      'materialized_views',
      '00000000-0000-0000-0000-000000000000',
      'Scheduled refresh of materialized views completed successfully',
      jsonb_build_object(
        'start_time', start_time,
        'end_time', now(),
        'duration_ms', extract(epoch from (now() - start_time)) * 1000
      )
    );

  EXCEPTION WHEN OTHERS THEN
    success := FALSE;
    error_message := SQLERRM;

    -- Log the error
    INSERT INTO public.activity_logs (
      user_id,
      action,
      entity_type,
      entity_id,
      description,
      metadata
    ) VALUES (
      '00000000-0000-0000-0000-000000000000', -- System user ID
      'refresh_error',
      'materialized_views',
      '00000000-0000-0000-0000-000000000000',
      'Scheduled refresh of materialized views failed: ' || error_message,
      jsonb_build_object(
        'start_time', start_time,
        'error_time', now(),
        'duration_ms', extract(epoch from (now() - start_time)) * 1000,
        'error', error_message
      )
    );
  END;

  end_time := now();

  -- Return the result as JSON
  refresh_result := jsonb_build_object(
    'success', success,
    'start_time', start_time,
    'end_time', end_time,
    'duration_ms', extract(epoch from (end_time - start_time)) * 1000
  );

  IF NOT success THEN
    refresh_result := refresh_result || jsonb_build_object('error', error_message);
  END IF;

  RETURN refresh_result;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.scheduled_refresh_materialized_views() TO authenticated;

-- ==========================================
-- PHASE 2: CREATE MANUAL REFRESH FUNCTION FOR SPECIFIC VIEWS
-- ==========================================

-- Create a function to refresh a specific materialized view
CREATE OR REPLACE FUNCTION public.refresh_specific_materialized_view(view_name TEXT)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  start_time TIMESTAMPTZ;
  end_time TIMESTAMPTZ;
  refresh_result JSON;
  success BOOLEAN := TRUE;
  error_message TEXT;
  valid_view BOOLEAN := FALSE;
BEGIN
  -- Check if the view name is valid
  IF view_name IN ('mv_monthly_revenue', 'mv_lead_conversion_metrics',
                  'mv_estimate_metrics', 'mv_user_activity_metrics',
                  'mv_dashboard_summary') THEN
    valid_view := TRUE;
  ELSE
    RETURN jsonb_build_object(
      'success', FALSE,
      'error', 'Invalid materialized view name'
    );
  END IF;

  start_time := now();

  BEGIN
    -- Refresh the specified materialized view
    EXECUTE 'REFRESH MATERIALIZED VIEW public.' || view_name;

    -- Log the successful refresh
    INSERT INTO public.activity_logs (
      user_id,
      action,
      entity_type,
      entity_id,
      description,
      metadata
    ) VALUES (
      '00000000-0000-0000-0000-000000000000', -- System user ID
      'refresh',
      'materialized_view',
      view_name,
      'Manual refresh of materialized view ' || view_name || ' completed successfully',
      jsonb_build_object(
        'view_name', view_name,
        'start_time', start_time,
        'end_time', now(),
        'duration_ms', extract(epoch from (now() - start_time)) * 1000
      )
    );

  EXCEPTION WHEN OTHERS THEN
    success := FALSE;
    error_message := SQLERRM;

    -- Log the error
    INSERT INTO public.activity_logs (
      user_id,
      action,
      entity_type,
      entity_id,
      description,
      metadata
    ) VALUES (
      '00000000-0000-0000-0000-000000000000', -- System user ID
      'refresh_error',
      'materialized_view',
      view_name,
      'Manual refresh of materialized view ' || view_name || ' failed: ' || error_message,
      jsonb_build_object(
        'view_name', view_name,
        'start_time', start_time,
        'error_time', now(),
        'duration_ms', extract(epoch from (now() - start_time)) * 1000,
        'error', error_message
      )
    );
  END;

  end_time := now();

  -- Return the result as JSON
  refresh_result := jsonb_build_object(
    'success', success,
    'view_name', view_name,
    'start_time', start_time,
    'end_time', end_time,
    'duration_ms', extract(epoch from (end_time - start_time)) * 1000
  );

  IF NOT success THEN
    refresh_result := refresh_result || jsonb_build_object('error', error_message);
  END IF;

  RETURN refresh_result;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.refresh_specific_materialized_view(TEXT) TO authenticated;
