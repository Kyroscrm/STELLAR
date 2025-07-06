-- ===============================================
-- SCHEMA MISMATCH FIX MIGRATION
-- Date: 2025-07-03 04:00:00
-- Issues: Missing columns causing 400 errors and system failures
-- ===============================================

-- Create admin SQL execution function first
CREATE OR REPLACE FUNCTION public.admin_execute_sql(query_text TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    result TEXT;
    admin_email TEXT := 'nayib@finalroofingcompany.com';
    current_user_email TEXT;
BEGIN
    -- Get current user email
    SELECT email INTO current_user_email
    FROM auth.users
    WHERE id = auth.uid();

    -- Check if current user is admin
    IF current_user_email != admin_email THEN
        RAISE EXCEPTION 'Access denied. Admin only function.';
    END IF;

    -- Execute the query
    EXECUTE query_text;

    RETURN 'Query executed successfully';
EXCEPTION
    WHEN OTHERS THEN
        RETURN 'Error: ' || SQLERRM;
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.admin_execute_sql TO authenticated;

-- FIX 1: Add missing 'status' column to time_entries
DO $$
BEGIN
    -- Add status column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'time_entries'
        AND column_name = 'status'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.time_entries
        ADD COLUMN status VARCHAR(50) DEFAULT 'active';

        -- Update existing records with appropriate status
        UPDATE public.time_entries
        SET status = CASE
            WHEN end_time IS NULL THEN 'active'
            ELSE 'completed'
        END
        WHERE status IS NULL;

        -- Add constraint
        ALTER TABLE public.time_entries
        ADD CONSTRAINT time_entries_status_check
        CHECK (status IN ('active', 'paused', 'completed', 'cancelled'));

        -- Add index for performance
        CREATE INDEX idx_time_entries_status ON public.time_entries(status);
    END IF;
END $$;

-- FIX 2: Add missing 'amount' column to change_orders
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'change_orders'
        AND column_name = 'amount'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.change_orders
        ADD COLUMN amount DECIMAL(10,2) DEFAULT 0.00;

        -- Update existing records
        UPDATE public.change_orders
        SET amount = 0.00
        WHERE amount IS NULL;

        -- Add index for performance
        CREATE INDEX idx_change_orders_amount ON public.change_orders(amount);
    END IF;
END $$;

-- FIX 3: Add missing 'estimate_number' column to estimates
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'estimates'
        AND column_name = 'estimate_number'
        AND table_schema = 'public'
    ) THEN
        -- Add the column
        ALTER TABLE public.estimates
        ADD COLUMN estimate_number VARCHAR(50);

        -- Update existing records with generated numbers
        UPDATE public.estimates
        SET estimate_number = 'EST-' || LPAD(ROW_NUMBER() OVER (ORDER BY created_at)::TEXT, 4, '0')
        WHERE estimate_number IS NULL;

        -- Make column NOT NULL and add unique constraint
        ALTER TABLE public.estimates
        ALTER COLUMN estimate_number SET NOT NULL;

        ALTER TABLE public.estimates
        ADD CONSTRAINT estimates_estimate_number_unique UNIQUE (estimate_number);

        -- Create auto-generation function
        CREATE OR REPLACE FUNCTION generate_estimate_number()
        RETURNS VARCHAR(50)
        LANGUAGE plpgsql
        AS $_func_$
        DECLARE
            next_num INTEGER;
        BEGIN
            SELECT COALESCE(MAX(CAST(SUBSTRING(estimate_number FROM 'EST-(\d+)') AS INTEGER)), 0) + 1
            INTO next_num
            FROM public.estimates
            WHERE estimate_number ~ '^EST-\d+$';

            RETURN 'EST-' || LPAD(next_num::TEXT, 4, '0');
        END;
        $_func_$;

        -- Create trigger for auto-generation
        CREATE OR REPLACE FUNCTION auto_estimate_number()
        RETURNS TRIGGER
        LANGUAGE plpgsql
        AS $_trig_$
        BEGIN
            IF NEW.estimate_number IS NULL THEN
                NEW.estimate_number := generate_estimate_number();
            END IF;
            RETURN NEW;
        END;
        $_trig_$;

        CREATE TRIGGER trigger_auto_estimate_number
            BEFORE INSERT ON public.estimates
            FOR EACH ROW
            EXECUTE FUNCTION auto_estimate_number();
    END IF;
END $$;

-- FIX 4: Add missing 'title' column to invoices
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'invoices'
        AND column_name = 'title'
        AND table_schema = 'public'
    ) THEN
        -- Add the column
        ALTER TABLE public.invoices
        ADD COLUMN title VARCHAR(255);

        -- Update existing records
        UPDATE public.invoices
        SET title = 'Invoice ' || COALESCE(invoice_number, 'New')
        WHERE title IS NULL;

        -- Make column NOT NULL
        ALTER TABLE public.invoices
        ALTER COLUMN title SET NOT NULL;

        -- Create auto-generation function
        CREATE OR REPLACE FUNCTION auto_invoice_title()
        RETURNS TRIGGER
        LANGUAGE plpgsql
        AS $_trig_$
        BEGIN
            IF NEW.title IS NULL THEN
                NEW.title := 'Invoice ' || COALESCE(NEW.invoice_number, 'New');
            END IF;
            RETURN NEW;
        END;
        $_trig_$;

        CREATE TRIGGER trigger_auto_invoice_title
            BEFORE INSERT ON public.invoices
            FOR EACH ROW
            EXECUTE FUNCTION auto_invoice_title();
    END IF;
END $$;

-- FIX 5: Add missing 'created_by' column to tasks
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'tasks'
        AND column_name = 'created_by'
        AND table_schema = 'public'
    ) THEN
        -- Add the column
        ALTER TABLE public.tasks
        ADD COLUMN created_by UUID REFERENCES auth.users(id);

        -- Update existing records with admin user
        UPDATE public.tasks
        SET created_by = '28dc0c62-8e09-44e3-9497-5f62c6a0b436'
        WHERE created_by IS NULL;

        -- Make column NOT NULL for future records
        ALTER TABLE public.tasks
        ALTER COLUMN created_by SET NOT NULL;

        -- Add index for performance
        CREATE INDEX idx_tasks_created_by ON public.tasks(created_by);
    END IF;
END $$;

-- Update table comments to force schema cache refresh
COMMENT ON TABLE public.time_entries IS 'Time tracking with status support - Updated 2025-07-03';
COMMENT ON TABLE public.change_orders IS 'Change orders with amount tracking - Updated 2025-07-03';
COMMENT ON TABLE public.estimates IS 'Estimates with auto-generated numbers - Updated 2025-07-03';
COMMENT ON TABLE public.invoices IS 'Invoices with title support - Updated 2025-07-03';
COMMENT ON TABLE public.tasks IS 'Tasks with created_by tracking - Updated 2025-07-03';

-- Grant permissions on updated tables
GRANT SELECT, INSERT, UPDATE, DELETE ON public.time_entries TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.change_orders TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.estimates TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.invoices TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tasks TO authenticated;
