-- Audit Logging Middleware Functions
-- This migration adds middleware functions to handle HTTP request metadata for audit logging

-- 1. Create a function to set request metadata in session variables
CREATE OR REPLACE FUNCTION public.set_request_metadata(
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_session_id TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Store metadata in session variables for later use by triggers
  IF p_ip_address IS NOT NULL THEN
    PERFORM set_config('audit.request.ip_address', p_ip_address, FALSE);
  END IF;

  IF p_user_agent IS NOT NULL THEN
    PERFORM set_config('audit.request.user_agent', p_user_agent, FALSE);
  END IF;

  IF p_session_id IS NOT NULL THEN
    PERFORM set_config('audit.request.session_id', p_session_id, FALSE);
  END IF;

  RETURN TRUE;
END;
$$;

-- 2. Update get_request_metadata function to check audit-specific variables first
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
  -- Try to get IP address from audit variables first, then request headers
  BEGIN
    ip_addr := nullif(current_setting('audit.request.ip_address', TRUE), '')::INET;
    IF ip_addr IS NULL THEN
      ip_addr := nullif(current_setting('request.headers', TRUE)::jsonb ->> 'x-forwarded-for', '')::INET;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    ip_addr := NULL;
  END;

  -- Try to get user agent from audit variables first, then request headers
  BEGIN
    user_agent := nullif(current_setting('audit.request.user_agent', TRUE), '');
    IF user_agent IS NULL THEN
      user_agent := nullif(current_setting('request.headers', TRUE)::jsonb ->> 'user-agent', '');
    END IF;
  EXCEPTION WHEN OTHERS THEN
    user_agent := NULL;
  END;

  -- Try to get session ID from audit variables first, then request headers
  BEGIN
    session_id := nullif(current_setting('audit.request.session_id', TRUE), '')::UUID;
    IF session_id IS NULL THEN
      session_id := nullif(current_setting('request.headers', TRUE)::jsonb ->> 'x-session-id', '')::UUID;
    END IF;
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

-- 3. Create a function to clear request metadata
CREATE OR REPLACE FUNCTION public.clear_request_metadata()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Clear audit metadata from session variables
  PERFORM set_config('audit.request.ip_address', NULL, FALSE);
  PERFORM set_config('audit.request.user_agent', NULL, FALSE);
  PERFORM set_config('audit.request.session_id', NULL, FALSE);

  RETURN TRUE;
END;
$$;

-- 4. Create a function to get audit logs for a specific entity
CREATE OR REPLACE FUNCTION public.get_entity_audit_logs(
  p_entity_type TEXT,
  p_entity_id UUID,
  p_limit INTEGER DEFAULT 100,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  action TEXT,
  description TEXT,
  old_data JSONB,
  new_data JSONB,
  changed_fields TEXT[],
  ip_address INET,
  user_agent TEXT,
  session_id UUID,
  compliance_level TEXT,
  risk_score INTEGER,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the user has permission to view the entity
  IF NOT has_permission(auth.uid(), p_entity_type || ':read') THEN
    RAISE EXCEPTION 'Permission denied to view audit logs for this entity';
  END IF;

  RETURN QUERY
  SELECT
    al.id,
    al.user_id,
    al.action,
    al.description,
    al.old_data,
    al.new_data,
    al.changed_fields,
    al.ip_address,
    al.user_agent,
    al.session_id,
    al.compliance_level,
    al.risk_score,
    al.created_at
  FROM
    public.activity_logs al
  WHERE
    al.entity_type = p_entity_type
    AND al.entity_id = p_entity_id
  ORDER BY
    al.created_at DESC
  LIMIT
    p_limit
  OFFSET
    p_offset;
END;
$$;

-- 5. Create a function to get field change history for a specific entity and field
CREATE OR REPLACE FUNCTION public.get_field_change_history(
  p_entity_type TEXT,
  p_entity_id UUID,
  p_field_name TEXT,
  p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
  log_id UUID,
  user_id UUID,
  old_value JSONB,
  new_value JSONB,
  changed_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the user has permission to view the entity
  IF NOT has_permission(auth.uid(), p_entity_type || ':read') THEN
    RAISE EXCEPTION 'Permission denied to view field history for this entity';
  END IF;

  RETURN QUERY
  SELECT
    al.id AS log_id,
    al.user_id,
    al.old_data -> p_field_name AS old_value,
    al.new_data -> p_field_name AS new_value,
    al.created_at AS changed_at
  FROM
    public.activity_logs al
  WHERE
    al.entity_type = p_entity_type
    AND al.entity_id = p_entity_id
    AND (al.changed_fields @> ARRAY[p_field_name] OR al.action = 'created')
  ORDER BY
    al.created_at DESC
  LIMIT
    p_limit;
END;
$$;

-- 6. Create a function to get user activity across all entities
CREATE OR REPLACE FUNCTION public.get_user_activity(
  p_user_id UUID DEFAULT NULL,
  p_from_date TIMESTAMPTZ DEFAULT NULL,
  p_to_date TIMESTAMPTZ DEFAULT NULL,
  p_limit INTEGER DEFAULT 100,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  entity_type TEXT,
  entity_id UUID,
  action TEXT,
  description TEXT,
  changed_fields TEXT[],
  ip_address INET,
  user_agent TEXT,
  session_id UUID,
  compliance_level TEXT,
  risk_score INTEGER,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Get the current user ID if not provided
  v_user_id := COALESCE(p_user_id, auth.uid());

  -- If not admin and trying to view another user's activity, raise exception
  IF v_user_id != auth.uid() AND NOT has_permission(auth.uid(), 'activity_logs:read') THEN
    RAISE EXCEPTION 'Permission denied to view other users activity logs';
  END IF;

  RETURN QUERY
  SELECT
    al.id,
    al.entity_type,
    al.entity_id,
    al.action,
    al.description,
    al.changed_fields,
    al.ip_address,
    al.user_agent,
    al.session_id,
    al.compliance_level,
    al.risk_score,
    al.created_at
  FROM
    public.activity_logs al
  WHERE
    (p_user_id IS NULL OR al.user_id = v_user_id)
    AND (p_from_date IS NULL OR al.created_at >= p_from_date)
    AND (p_to_date IS NULL OR al.created_at <= p_to_date)
  ORDER BY
    al.created_at DESC
  LIMIT
    p_limit
  OFFSET
    p_offset;
END;
$$;
