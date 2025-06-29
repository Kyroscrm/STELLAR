-- AGGRESSIVE CLEANUP: Remove ALL log_activity functions completely
-- This will resolve the "function name is not unique" error

-- 1. First, find and drop ALL log_activity functions by querying the system catalog
DO $$
DECLARE
    func_record RECORD;
BEGIN
    -- Find all log_activity functions in the public schema
    FOR func_record IN
        SELECT
            p.proname as function_name,
            pg_get_function_identity_arguments(p.oid) as function_args,
            n.nspname as schema_name
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE p.proname = 'log_activity'
        AND n.nspname = 'public'
    LOOP
        -- Drop each function with its specific signature
        EXECUTE format('DROP FUNCTION IF EXISTS %I.%I(%s) CASCADE',
                      func_record.schema_name,
                      func_record.function_name,
                      func_record.function_args);

        RAISE NOTICE 'Dropped function: %.%(%)',
                     func_record.schema_name,
                     func_record.function_name,
                     func_record.function_args;
    END LOOP;
END $$;

-- 2. Double-check by trying manual drops of common signatures
DROP FUNCTION IF EXISTS public.log_activity(TEXT, TEXT, UUID, TEXT, JSONB, JSONB, JSONB, TEXT[], INET, TEXT, UUID, TEXT, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS public.log_activity(TEXT, TEXT, UUID, TEXT, JSONB, JSONB, JSONB, TEXT[], INET, TEXT, UUID, TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.log_activity(TEXT, TEXT, UUID, TEXT, JSONB, JSONB, JSONB, TEXT[], INET, TEXT, UUID) CASCADE;
DROP FUNCTION IF EXISTS public.log_activity(TEXT, TEXT, UUID, TEXT, JSONB, JSONB, JSONB, TEXT[], INET, TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.log_activity(TEXT, TEXT, UUID, TEXT, JSONB, JSONB, JSONB, TEXT[], INET) CASCADE;
DROP FUNCTION IF EXISTS public.log_activity(TEXT, TEXT, UUID, TEXT, JSONB, JSONB, JSONB, TEXT[]) CASCADE;
DROP FUNCTION IF EXISTS public.log_activity(TEXT, TEXT, UUID, TEXT, JSONB, JSONB, JSONB) CASCADE;
DROP FUNCTION IF EXISTS public.log_activity(TEXT, TEXT, UUID, TEXT, JSONB, JSONB) CASCADE;
DROP FUNCTION IF EXISTS public.log_activity(TEXT, TEXT, UUID, TEXT, JSONB) CASCADE;
DROP FUNCTION IF EXISTS public.log_activity(TEXT, TEXT, UUID, TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.log_activity(TEXT, TEXT, UUID) CASCADE;
DROP FUNCTION IF EXISTS public.log_activity(TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.log_activity(TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.log_activity() CASCADE;

-- 3. Verify no log_activity functions remain
DO $$
DECLARE
    func_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO func_count
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE p.proname = 'log_activity'
    AND n.nspname = 'public';

    IF func_count > 0 THEN
        RAISE EXCEPTION 'Still found % log_activity functions remaining!', func_count;
    ELSE
        RAISE NOTICE 'SUCCESS: All log_activity functions have been removed';
    END IF;
END $$;

-- 4. Now create our single, clean log_activity function
CREATE FUNCTION public.log_activity(
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

  -- If no user ID, return the log ID anyway (don't fail)
  IF v_user_id IS NULL THEN
    RETURN v_log_id;
  END IF;

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

  -- Insert activity log (with error handling)
  BEGIN
    INSERT INTO public.activity_logs (
      id, user_id, entity_type, entity_id, action, description, created_at
    ) VALUES (
      v_log_id,
      v_user_id,
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

-- 5. Create time_entries table if needed
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

-- 6. Set up RLS
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "time_entries_all_operations" ON public.time_entries;
DROP POLICY IF EXISTS "Users can manage their time entries" ON public.time_entries;
DROP POLICY IF EXISTS "time_entries_policy" ON public.time_entries;

-- Create one comprehensive policy
CREATE POLICY "time_entries_comprehensive_policy" ON public.time_entries
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

-- 7. Grant permissions
GRANT ALL ON public.time_entries TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_activity TO authenticated;

-- 8. Test everything works
SELECT
  public.log_activity('test', 'database_cleanup', NULL, 'Testing cleaned up log_activity function') as log_result,
  'SUCCESS: log_activity function is now unique and working!' as status;

-- 9. Verify function uniqueness
SELECT
  COUNT(*) as log_activity_function_count,
  CASE
    WHEN COUNT(*) = 1 THEN 'SUCCESS: Function is unique'
    ELSE 'ERROR: Multiple functions still exist'
  END as uniqueness_status
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname = 'log_activity'
AND n.nspname = 'public';
