-- Audit Logging Triggers
-- This migration adds triggers to critical tables to capture changes for audit logging

-- Helper function to calculate changed fields between old and new records
CREATE OR REPLACE FUNCTION public.get_changed_fields(old_record JSONB, new_record JSONB)
RETURNS TEXT[]
LANGUAGE plpgsql
AS $$
DECLARE
  changed_fields TEXT[] := '{}';
  field_name TEXT;
BEGIN
  -- Compare each field in new_record with old_record
  FOR field_name IN SELECT jsonb_object_keys(new_record)
  LOOP
    -- If field exists in both records and values are different, or field only exists in one record
    IF (old_record -> field_name) IS DISTINCT FROM (new_record -> field_name) THEN
      changed_fields := array_append(changed_fields, field_name);
    END IF;
  END LOOP;

  RETURN changed_fields;
END;
$$;

-- Helper function to extract request metadata
CREATE OR REPLACE FUNCTION public.get_request_metadata()
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  request_data JSONB;
  ip_addr INET := NULL;
  user_agent TEXT := NULL;
  session_id UUID := NULL;
BEGIN
  -- Try to get IP address from request.headers
  BEGIN
    ip_addr := nullif(current_setting('request.headers', true)::jsonb ->> 'x-forwarded-for', '')::INET;
  EXCEPTION WHEN OTHERS THEN
    ip_addr := NULL;
  END;

  -- Try to get user agent from request.headers
  BEGIN
    user_agent := nullif(current_setting('request.headers', true)::jsonb ->> 'user-agent', '');
  EXCEPTION WHEN OTHERS THEN
    user_agent := NULL;
  END;

  -- Try to get session ID from request.headers
  BEGIN
    session_id := nullif(current_setting('request.headers', true)::jsonb ->> 'x-session-id', '')::UUID;
  EXCEPTION WHEN OTHERS THEN
    session_id := NULL;
  END;

  request_data := jsonb_build_object(
    'ip_address', ip_addr,
    'user_agent', user_agent,
    'session_id', session_id
  );

  RETURN request_data;
END;
$$;

-- Generic trigger function for audit logging
CREATE OR REPLACE FUNCTION public.audit_trigger_func()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  old_data JSONB := NULL;
  new_data JSONB := NULL;
  changed_fields TEXT[] := NULL;
  entity_type TEXT;
  entity_id UUID;
  action_type TEXT;
  description TEXT;
  request_meta JSONB;
  ip_addr INET := NULL;
  user_agent TEXT := NULL;
  session_id UUID := NULL;
  compliance_level TEXT := 'standard';
  risk_score INTEGER := 0;
BEGIN
  -- Get table name as entity_type
  entity_type := TG_TABLE_NAME;

  -- Get request metadata
  request_meta := public.get_request_metadata();
  ip_addr := (request_meta ->> 'ip_address')::INET;
  user_agent := request_meta ->> 'user_agent';
  session_id := (request_meta ->> 'session_id')::UUID;

  -- Set action type based on operation
  IF (TG_OP = 'INSERT') THEN
    action_type := 'created';
    new_data := to_jsonb(NEW);
    entity_id := NEW.id;
    description := entity_type || ' created';

    -- For new records, there are no changed fields (everything is new)
    changed_fields := ARRAY(SELECT jsonb_object_keys(new_data));

  ELSIF (TG_OP = 'UPDATE') THEN
    action_type := 'updated';
    old_data := to_jsonb(OLD);
    new_data := to_jsonb(NEW);
    entity_id := NEW.id;

    -- Calculate changed fields
    changed_fields := public.get_changed_fields(old_data, new_data);

    -- If no fields changed, exit early
    IF array_length(changed_fields, 1) IS NULL THEN
      RETURN NULL;
    END IF;

    description := entity_type || ' updated';

  ELSIF (TG_OP = 'DELETE') THEN
    action_type := 'deleted';
    old_data := to_jsonb(OLD);
    entity_id := OLD.id;
    description := entity_type || ' deleted';
  END IF;

  -- Calculate risk score based on entity type and action
  -- Higher risk for sensitive operations
  IF entity_type IN ('profiles', 'user_sessions', 'roles', 'permissions') THEN
    risk_score := 8;  -- Security-related entities
    compliance_level := 'high';
  ELSIF entity_type IN ('customers', 'invoices', 'payments') THEN
    risk_score := 5;  -- Financial/customer data
    compliance_level := 'medium';
  ELSE
    risk_score := 3;  -- Standard business data
    compliance_level := 'standard';
  END IF;

  -- Increase risk score for delete operations
  IF action_type = 'deleted' THEN
    risk_score := risk_score + 2;
  END IF;

  -- Log the activity
  PERFORM public.log_activity(
    action_type,
    entity_type,
    entity_id,
    description,
    NULL, -- metadata
    old_data,
    new_data,
    changed_fields,
    ip_addr,
    user_agent,
    session_id,
    compliance_level,
    risk_score
  );

  RETURN NULL; -- for AFTER triggers
END;
$$;

-- Apply the trigger to critical tables

-- Customers table
DROP TRIGGER IF EXISTS audit_customers_trigger ON public.customers;
CREATE TRIGGER audit_customers_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

-- Leads table
DROP TRIGGER IF EXISTS audit_leads_trigger ON public.leads;
CREATE TRIGGER audit_leads_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

-- Estimates table
DROP TRIGGER IF EXISTS audit_estimates_trigger ON public.estimates;
CREATE TRIGGER audit_estimates_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.estimates
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

-- Invoices table
DROP TRIGGER IF EXISTS audit_invoices_trigger ON public.invoices;
CREATE TRIGGER audit_invoices_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

-- Jobs table
DROP TRIGGER IF EXISTS audit_jobs_trigger ON public.jobs;
CREATE TRIGGER audit_jobs_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.jobs
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

-- Tasks table
DROP TRIGGER IF EXISTS audit_tasks_trigger ON public.tasks;
CREATE TRIGGER audit_tasks_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

-- Profiles table (for user changes)
DROP TRIGGER IF EXISTS audit_profiles_trigger ON public.profiles;
CREATE TRIGGER audit_profiles_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

-- Roles table
DROP TRIGGER IF EXISTS audit_roles_trigger ON public.roles;
CREATE TRIGGER audit_roles_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.roles
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

-- Permissions table
DROP TRIGGER IF EXISTS audit_permissions_trigger ON public.permissions;
CREATE TRIGGER audit_permissions_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.permissions
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

-- Role_permissions table
DROP TRIGGER IF EXISTS audit_role_permissions_trigger ON public.role_permissions;
CREATE TRIGGER audit_role_permissions_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.role_permissions
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();
