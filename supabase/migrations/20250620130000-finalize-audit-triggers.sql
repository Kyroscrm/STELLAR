-- Finalize Audit Triggers
-- This migration ensures consistent naming and attachment of audit triggers

-- 1. Create alias function audit_trigger that calls audit_trigger_func
-- This maintains backward compatibility while allowing the new naming convention
CREATE OR REPLACE FUNCTION public.audit_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Simply call the existing audit_trigger_func
  RETURN public.audit_trigger_func();
END;
$$;

-- 2. Re-attach audit triggers to all critical tables with consistent naming
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN ARRAY[
    'customers',
    'leads',
    'estimates',
    'invoices',
    'jobs',
    'tasks',
    'profiles',
    'roles',
    'permissions',
    'role_permissions'
  ] LOOP
    -- Drop any existing triggers with either naming convention
    EXECUTE format('DROP TRIGGER IF EXISTS audit_%1$s ON public.%1$s;', tbl);
    EXECUTE format('DROP TRIGGER IF EXISTS audit_%1$s_trigger ON public.%1$s;', tbl);

    -- Create new trigger with consistent naming
    EXECUTE format('
      CREATE TRIGGER audit_%1$s
        AFTER INSERT OR UPDATE OR DELETE
        ON public.%1$s
        FOR EACH ROW
        EXECUTE FUNCTION public.audit_trigger();
    ', tbl);
  END LOOP;
END $$;

-- 3. Update the activity_logs table to ensure it has entity_type and entity_id columns
-- This handles the case where the table_name and record_id columns were used in the provided function
DO $$
BEGIN
  -- Add entity_type column if table_name exists but entity_type doesn't
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'activity_logs' AND column_name = 'table_name'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'activity_logs' AND column_name = 'entity_type'
  ) THEN
    ALTER TABLE public.activity_logs ADD COLUMN entity_type TEXT;
    UPDATE public.activity_logs SET entity_type = table_name WHERE entity_type IS NULL;
  END IF;

  -- Add entity_id column if record_id exists but entity_id doesn't
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'activity_logs' AND column_name = 'record_id'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'activity_logs' AND column_name = 'entity_id'
  ) THEN
    ALTER TABLE public.activity_logs ADD COLUMN entity_id UUID;
    UPDATE public.activity_logs SET entity_id = record_id::UUID WHERE entity_id IS NULL;
  END IF;
END $$;
