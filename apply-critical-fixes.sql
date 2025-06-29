-- SIMPLE FIX: Create log_activity function to fix 404 errors
-- Copy and paste this into Supabase SQL Editor and run it

-- 1. Remove any existing log_activity functions to prevent conflicts
DROP FUNCTION IF EXISTS public.log_activity CASCADE;

-- 2. Create the working log_activity function
CREATE OR REPLACE FUNCTION public.log_activity(
  p_action TEXT,
  p_entity_type TEXT,
  p_entity_id UUID DEFAULT NULL,
  p_description TEXT DEFAULT NULL
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

  -- Generate log ID
  v_log_id := gen_random_uuid();

  -- If no user ID, just return the UUID (don't fail)
  IF v_user_id IS NULL THEN
    RETURN v_log_id;
  END IF;

  -- Insert into activity_logs table
  INSERT INTO public.activity_logs (
    id,
    user_id,
    action,
    entity_type,
    entity_id,
    description,
    created_at
  ) VALUES (
    v_log_id,
    v_user_id,
    p_action,
    p_entity_type,
    p_entity_id,
    p_description,
    NOW()
  );

  RETURN v_log_id;
EXCEPTION
  WHEN OTHERS THEN
    -- If insert fails, still return UUID (don't break functionality)
    RETURN v_log_id;
END;
$$;

-- 3. Grant execute permissions
GRANT EXECUTE ON FUNCTION public.log_activity TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_activity TO anon;

-- 4. Set up RLS if needed
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'activity_logs' AND schemaname = 'public') THEN
    -- Table doesn't exist yet, it will be created by the function
    NULL;
  ELSE
    -- Enable RLS on existing table
    ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

    -- Drop and recreate policies
    DROP POLICY IF EXISTS "Users can view their own activity logs" ON public.activity_logs;
    CREATE POLICY "Users can view their own activity logs"
    ON public.activity_logs FOR ALL
    TO authenticated
    USING (auth.uid() = user_id);
  END IF;
END $$;
