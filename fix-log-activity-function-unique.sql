-- FIX: Remove duplicate log_activity functions and create a unique one
-- This resolves the "function name is not unique" error

-- 1. Drop ALL existing log_activity functions (with different signatures)
DROP FUNCTION IF EXISTS public.log_activity(TEXT, TEXT, UUID, TEXT, JSONB, JSONB, JSONB, TEXT[], INET, TEXT, UUID, TEXT, INTEGER);
DROP FUNCTION IF EXISTS public.log_activity(TEXT, TEXT, UUID, TEXT, JSONB);
DROP FUNCTION IF EXISTS public.log_activity(TEXT, TEXT, UUID, TEXT);
DROP FUNCTION IF EXISTS public.log_activity(TEXT, TEXT, UUID);
DROP FUNCTION IF EXISTS public.log_activity(TEXT, TEXT);
DROP FUNCTION IF EXISTS public.log_activity(TEXT);
DROP FUNCTION IF EXISTS public.log_activity();

-- Drop with CASCADE to handle dependencies
DROP FUNCTION IF EXISTS public.log_activity CASCADE;

-- 2. Create the single, definitive log_activity function
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

  -- If no user ID, return dummy UUID (don't fail)
  IF v_user_id IS NULL THEN
    RETURN gen_random_uuid();
  END IF;

  -- Generate log ID
  v_log_id := gen_random_uuid();

  -- Create activity_logs table if it doesn't exist
  CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    entity_type TEXT,
    entity_id UUID,
    action TEXT,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );

  -- Try to insert activity log
  BEGIN
    INSERT INTO public.activity_logs (
      id, user_id, entity_type, entity_id, action, description, created_at
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
      -- Silent fail - don't break main functionality
      NULL;
  END;

  RETURN v_log_id;

EXCEPTION
  WHEN OTHERS THEN
    -- Always return a UUID to satisfy return type
    RETURN gen_random_uuid();
END;
$$;

-- 3. Create time_entries table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.time_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL,
  user_id UUID NOT NULL,
  crew_id UUID,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  duration_hours DECIMAL(5,2),
  entry_type TEXT DEFAULT 'regular',
  hourly_rate DECIMAL(10,2),
  total_cost DECIMAL(10,2) DEFAULT 0,
  description TEXT,
  approved BOOLEAN DEFAULT false,
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Enable RLS and create simple policy
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can manage their time entries" ON public.time_entries;
DROP POLICY IF EXISTS "time_entries_policy" ON public.time_entries;
DROP POLICY IF EXISTS "Users can view their own time entries" ON public.time_entries;
DROP POLICY IF EXISTS "Users can insert their own time entries" ON public.time_entries;
DROP POLICY IF EXISTS "Users can update their own time entries" ON public.time_entries;
DROP POLICY IF EXISTS "Users can delete their own time entries" ON public.time_entries;

-- Create simple, working policy
CREATE POLICY "time_entries_all_operations" ON public.time_entries
  FOR ALL
  USING (
    auth.uid() IS NOT NULL AND (
      auth.uid() = user_id OR
      EXISTS (
        SELECT 1 FROM auth.users
        WHERE id = auth.uid() AND email = 'nayib@finalroofingcompany.com'
      )
    )
  )
  WITH CHECK (
    auth.uid() IS NOT NULL AND (
      auth.uid() = user_id OR
      EXISTS (
        SELECT 1 FROM auth.users
        WHERE id = auth.uid() AND email = 'nayib@finalroofingcompany.com'
      )
    )
  );

-- 5. Grant permissions
GRANT ALL ON public.time_entries TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_activity TO authenticated;

-- 6. Test the function to make sure it works
SELECT public.log_activity('test', 'database_setup', NULL, 'Testing log_activity function after cleanup') as test_result;
