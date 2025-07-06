-- Comprehensive test script for CRM fixes
-- Generated to verify schema and permission fixes
-- Timestamp: 2025-06-14

-- Test 1: Schema Verification
DO $$
DECLARE
    required_columns RECORD;
    missing_columns TEXT := '';
BEGIN
    -- Check time_entries
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'time_entries' AND column_name = 'status'
    ) THEN
        missing_columns := missing_columns || 'time_entries.status, ';
    END IF;

    -- Check change_orders
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'change_orders' AND column_name = 'amount'
    ) THEN
        missing_columns := missing_columns || 'change_orders.amount, ';
    END IF;

    -- Check estimates
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'estimates' AND column_name = 'estimate_number'
    ) THEN
        missing_columns := missing_columns || 'estimates.estimate_number, ';
    END IF;

    -- Check invoices
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'invoices' AND column_name = 'title'
    ) THEN
        missing_columns := missing_columns || 'invoices.title, ';
    END IF;

    -- Check tasks
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'tasks' AND column_name = 'created_by'
    ) THEN
        missing_columns := missing_columns || 'tasks.created_by, ';
    END IF;

    IF missing_columns != '' THEN
        RAISE EXCEPTION 'Missing columns: %', missing_columns;
    END IF;
END $$;

-- Test 2: RLS Policy Verification
DO $$
DECLARE
    tables CURSOR FOR
        SELECT tablename
        FROM pg_tables
        WHERE schemaname = 'public';
    r RECORD;
BEGIN
    FOR r IN tables LOOP
        IF NOT EXISTS (
            SELECT 1 FROM pg_policies
            WHERE tablename = r.tablename AND schemaname = 'public'
        ) THEN
            RAISE WARNING 'Table % has no RLS policies', r.tablename;
        END IF;
    END LOOP;
END $$;

-- Test 3: Admin User Permissions
DO $$
DECLARE
    admin_email TEXT := 'nayib@finalroofingcompany.com';
    tables CURSOR FOR
        SELECT tablename
        FROM pg_tables
        WHERE schemaname = 'public';
    r RECORD;
BEGIN
    -- Verify admin user exists
    IF NOT EXISTS (
        SELECT 1 FROM auth.users
        WHERE email = admin_email
    ) THEN
        RAISE EXCEPTION 'Admin user not found';
    END IF;

    -- Test permissions on each table
    FOR r IN tables LOOP
        EXECUTE format('SET LOCAL ROLE authenticated; SELECT 1 FROM %I LIMIT 1', r.tablename);
    END LOOP;
END $$;

-- Test 4: Data Integrity
DO $$
DECLARE
    orphaned_records INTEGER;
BEGIN
    -- Check for orphaned time entries
    SELECT COUNT(*) INTO orphaned_records
    FROM time_entries te
    LEFT JOIN jobs j ON te.job_id = j.id
    WHERE j.id IS NULL AND te.job_id IS NOT NULL;

    IF orphaned_records > 0 THEN
        RAISE WARNING 'Found % orphaned time entries', orphaned_records;
    END IF;

    -- Check for orphaned change orders
    SELECT COUNT(*) INTO orphaned_records
    FROM change_orders co
    LEFT JOIN jobs j ON co.job_id = j.id
    WHERE j.id IS NULL AND co.job_id IS NOT NULL;

    IF orphaned_records > 0 THEN
        RAISE WARNING 'Found % orphaned change orders', orphaned_records;
    END IF;
END $$;

-- Test 5: Function Verification
DO $$
DECLARE
    required_functions TEXT[] := ARRAY[
        'handle_new_time_entry',
        'log_activity',
        'process_change_order'
    ];
    missing_functions TEXT := '';
    func TEXT;
BEGIN
    FOREACH func IN ARRAY required_functions LOOP
        IF NOT EXISTS (
            SELECT 1 FROM pg_proc
            WHERE proname = func
        ) THEN
            missing_functions := missing_functions || func || ', ';
        END IF;
    END LOOP;

    IF missing_functions != '' THEN
        RAISE WARNING 'Missing functions: %', missing_functions;
    END IF;
END $$;
