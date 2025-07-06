-- =================================================================
-- Add Comprehensive Audit Columns (created_by, updated_by)
-- =================================================================
-- This script adds created_by and updated_by columns to all core
-- tables and sets up triggers to automatically manage them.
--
-- This fixes "column not found in schema cache" errors and adds
-- critical audit capabilities to the CRM.
-- =================================================================

-- 1. Add columns to all relevant tables
DO $$
DECLARE
    table_name TEXT;
    tables_to_modify TEXT[] := ARRAY[
        'leads', 'customers', 'jobs', 'estimates', 'invoices',
        'tasks', 'time_entries', 'change_orders', 'payments',
        'documents', 'estimate_line_items', 'invoice_line_items'
    ];
BEGIN
    FOREACH table_name IN ARRAY tables_to_modify
    LOOP
        EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;', table_name);
        EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;', table_name);
        RAISE NOTICE 'Added audit columns to %', table_name;
    END LOOP;
END;
$$;


-- 2. Create the trigger function to automatically set the new columns
CREATE OR REPLACE FUNCTION public.set_audit_columns()
RETURNS TRIGGER AS $$
BEGIN
    -- Set created_by on new records
    IF (TG_OP = 'INSERT') THEN
        NEW.created_by = auth.uid();
        NEW.updated_by = auth.uid();
    -- Set updated_by on existing records
    ELSIF (TG_OP = 'UPDATE') THEN
        NEW.updated_by = auth.uid();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 3. Attach the trigger to all modified tables
DO $$
DECLARE
    table_name TEXT;
    trigger_name TEXT;
    tables_to_trigger TEXT[] := ARRAY[
        'leads', 'customers', 'jobs', 'estimates', 'invoices',
        'tasks', 'time_entries', 'change_orders', 'payments',
        'documents', 'estimate_line_items', 'invoice_line_items'
    ];
BEGIN
    FOREACH table_name IN ARRAY tables_to_trigger
    LOOP
        trigger_name := 'trigger_set_audit_columns_on_' || table_name;
        -- Drop existing trigger if it exists
        EXECUTE format('DROP TRIGGER IF EXISTS %I ON public.%I;', trigger_name, table_name);
        -- Create the new trigger
        EXECUTE format('
            CREATE TRIGGER %I
            BEFORE INSERT OR UPDATE ON public.%I
            FOR EACH ROW EXECUTE FUNCTION public.set_audit_columns();
        ', trigger_name, table_name);
        RAISE NOTICE 'Created audit trigger for %', table_name;
    END LOOP;
END;
$$;


-- =================================================================
-- Audit Columns Setup Complete.
-- =================================================================
