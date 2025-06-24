-- Audit Logging Enhancements: Extend activity_logs and add user_sessions
-- This migration enhances the audit trail by storing old/new record data, changed fields, IP, UA, session info.

-- 1. Extend activity_logs table
ALTER TABLE public.activity_logs
  ADD COLUMN IF NOT EXISTS old_data JSONB,
  ADD COLUMN IF NOT EXISTS new_data JSONB,
  ADD COLUMN IF NOT EXISTS changed_fields TEXT[],
  ADD COLUMN IF NOT EXISTS ip_address INET,
  ADD COLUMN IF NOT EXISTS user_agent TEXT,
  ADD COLUMN IF NOT EXISTS session_id UUID,
  ADD COLUMN IF NOT EXISTS compliance_level TEXT,
  ADD COLUMN IF NOT EXISTS risk_score INTEGER;

-- 2. Create user_sessions table
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  login_time TIMESTAMPTZ DEFAULT now(),
  logout_time TIMESTAMPTZ,
  ip_address INET,
  user_agent TEXT,
  device_info JSONB,
  location_data JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  last_active_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Add RLS policies to user_sessions
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- Users can view their own sessions
CREATE POLICY "Users can view their own sessions" ON public.user_sessions
  FOR SELECT USING (auth.uid() = user_id);

-- Users can update their own sessions (for logout)
CREATE POLICY "Users can update their own sessions" ON public.user_sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- Only the system can insert sessions (via triggers/functions)
CREATE POLICY "System can insert sessions" ON public.user_sessions
  FOR INSERT WITH CHECK (has_permission(auth.uid(), 'user_sessions:create'));

-- 4. Create index on user_sessions for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_login_time ON public.user_sessions(login_time);
CREATE INDEX IF NOT EXISTS idx_user_sessions_is_active ON public.user_sessions(is_active);

-- 5. Create index on activity_logs for faster lookups with new fields
CREATE INDEX IF NOT EXISTS idx_activity_logs_session_id ON public.activity_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_compliance_level ON public.activity_logs(compliance_level);

-- 6. Update the log_activity function to accept and store all new columns
CREATE OR REPLACE FUNCTION public.log_activity(
  p_action TEXT,
  p_entity_type TEXT,
  p_entity_id UUID,
  p_description TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL,
  p_old_data JSONB DEFAULT NULL,
  p_new_data JSONB DEFAULT NULL,
  p_changed_fields TEXT[] DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_session_id UUID DEFAULT NULL,
  p_compliance_level TEXT DEFAULT 'standard',
  p_risk_score INTEGER DEFAULT 0
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_log_id UUID;
BEGIN
  -- Get the current user ID
  v_user_id := auth.uid();

  -- If no user ID, use a system user ID or raise an exception
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User ID is required for activity logging';
  END IF;

  -- Insert the activity log
  INSERT INTO public.activity_logs (
    id,
    user_id,
    entity_type,
    entity_id,
    action,
    description,
    metadata,
    old_data,
    new_data,
    changed_fields,
    ip_address,
    user_agent,
    session_id,
    compliance_level,
    risk_score
  ) VALUES (
    gen_random_uuid(),
    v_user_id,
    p_entity_type,
    p_entity_id,
    p_action,
    p_description,
    p_metadata,
    p_old_data,
    p_new_data,
    p_changed_fields,
    p_ip_address,
    p_user_agent,
    p_session_id,
    p_compliance_level,
    p_risk_score
  )
  RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$;

-- 7. Create a function to start a new user session
CREATE OR REPLACE FUNCTION public.start_user_session(
  p_user_id UUID,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_device_info JSONB DEFAULT NULL,
  p_location_data JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_session_id UUID;
BEGIN
  -- Create a new session
  INSERT INTO public.user_sessions (
    id,
    user_id,
    login_time,
    ip_address,
    user_agent,
    device_info,
    location_data,
    is_active,
    last_active_at
  ) VALUES (
    gen_random_uuid(),
    p_user_id,
    now(),
    p_ip_address,
    p_user_agent,
    p_device_info,
    p_location_data,
    TRUE,
    now()
  )
  RETURNING id INTO v_session_id;

  -- Log the session start
  PERFORM public.log_activity(
    'session_start',
    'user_sessions',
    v_session_id,
    'User session started',
    jsonb_build_object('user_id', p_user_id),
    NULL,
    jsonb_build_object(
      'user_id', p_user_id,
      'login_time', now(),
      'ip_address', p_ip_address,
      'user_agent', p_user_agent
    ),
    NULL,
    p_ip_address,
    p_user_agent,
    v_session_id
  );

  RETURN v_session_id;
END;
$$;

-- 8. Create a function to end a user session
CREATE OR REPLACE FUNCTION public.end_user_session(
  p_session_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_ip_address INET;
  v_user_agent TEXT;
BEGIN
  -- Get session details
  SELECT user_id, ip_address, user_agent
  INTO v_user_id, v_ip_address, v_user_agent
  FROM public.user_sessions
  WHERE id = p_session_id AND is_active = TRUE;

  -- If session not found or already inactive
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  -- Update the session
  UPDATE public.user_sessions
  SET logout_time = now(),
      is_active = FALSE
  WHERE id = p_session_id;

  -- Log the session end
  PERFORM public.log_activity(
    'session_end',
    'user_sessions',
    p_session_id,
    'User session ended',
    jsonb_build_object('user_id', v_user_id),
    jsonb_build_object(
      'user_id', v_user_id,
      'is_active', TRUE
    ),
    jsonb_build_object(
      'user_id', v_user_id,
      'logout_time', now(),
      'is_active', FALSE
    ),
    ARRAY['logout_time', 'is_active'],
    v_ip_address,
    v_user_agent,
    p_session_id
  );

  RETURN TRUE;
END;
$$;

-- 9. Create a function to update session activity
CREATE OR REPLACE FUNCTION public.update_session_activity(
  p_session_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.user_sessions
  SET last_active_at = now()
  WHERE id = p_session_id AND is_active = TRUE;

  RETURN FOUND;
END;
$$;

-- 10. Add user_sessions type to the Supabase enums
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type
    WHERE typname = 'session_status'
  ) THEN
    CREATE TYPE session_status AS ENUM ('active', 'expired', 'terminated');
  END IF;
END$$;
