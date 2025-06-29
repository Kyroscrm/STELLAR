-- COPY AND PASTE THIS INTO SUPABASE SQL EDITOR
-- This creates the missing time_entries table and log_activity function

-- 1. Create time entry type enum
DO $$ BEGIN
  CREATE TYPE time_entry_type AS ENUM ('regular', 'overtime', 'travel', 'break');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 2. Create time_entries table
CREATE TABLE IF NOT EXISTS public.time_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL,
  user_id UUID NOT NULL,
  crew_id UUID,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  duration_hours DECIMAL(5,2),
  entry_type time_entry_type DEFAULT 'regular',
  hourly_rate DECIMAL(10,2),
  total_cost DECIMAL(10,2) DEFAULT 0,
  description TEXT,
  approved BOOLEAN DEFAULT false,
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create log_activity function
CREATE OR REPLACE FUNCTION public.log_activity(
  p_action TEXT,
  p_entity_type TEXT,
  p_entity_id UUID DEFAULT NULL,
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

  -- If no user ID, return dummy UUID
  IF v_user_id IS NULL THEN
    RETURN gen_random_uuid();
  END IF;

  -- Generate log ID
  v_log_id := gen_random_uuid();

  -- Try to insert activity log
  BEGIN
    INSERT INTO public.activity_logs (
      id, user_id, entity_type, entity_id, action, description,
      created_at
    ) VALUES (
      v_log_id, v_user_id,
      COALESCE(p_entity_type, 'unknown'),
      p_entity_id,
      COALESCE(p_action, 'unknown'),
      p_description,
      NOW()
    );
  EXCEPTION
    WHEN OTHERS THEN
      -- Silent fail
      NULL;
  END;

  RETURN v_log_id;
EXCEPTION
  WHEN OTHERS THEN
    RETURN gen_random_uuid();
END;
$$;

-- 4. Enable RLS and create policies
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their time entries" ON public.time_entries
  USING (auth.uid() = user_id);

-- 5. Grant permissions
GRANT ALL ON public.time_entries TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_activity TO authenticated;
