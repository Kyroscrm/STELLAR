-- Function to verify user permissions
CREATE OR REPLACE FUNCTION verify_user_permissions(p_email text)
RETURNS TABLE (
    entity text,
    operation text,
    has_permission boolean
) AS $$
DECLARE
    v_user_id uuid;
BEGIN
    -- Get user ID
    SELECT id INTO v_user_id
    FROM auth.users
    WHERE email = p_email;

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'User with email % not found', p_email;
    END IF;

    RETURN QUERY
    WITH required_permissions AS (
        SELECT unnest(ARRAY[
            'leads:create', 'leads:read', 'leads:update', 'leads:delete',
            'leads:read:all', 'leads:update:all', 'leads:delete:all',
            'customers:create', 'customers:read', 'customers:update', 'customers:delete',
            'customers:read:all', 'customers:update:all', 'customers:delete:all',
            'jobs:create', 'jobs:read', 'jobs:update', 'jobs:delete',
            'jobs:read:all', 'jobs:update:all', 'jobs:delete:all',
            'estimates:create', 'estimates:read', 'estimates:update', 'estimates:delete',
            'estimates:read:all', 'estimates:update:all', 'estimates:delete:all',
            'invoices:create', 'invoices:read', 'invoices:update', 'invoices:delete',
            'invoices:read:all', 'invoices:update:all', 'invoices:delete:all',
            'tasks:create', 'tasks:read', 'tasks:update', 'tasks:delete',
            'tasks:read:all', 'tasks:update:all', 'tasks:delete:all',
            'time_entries:create', 'time_entries:read', 'time_entries:update', 'time_entries:delete',
            'time_entries:read:all', 'time_entries:update:all', 'time_entries:delete:all',
            'change_orders:create', 'change_orders:read', 'change_orders:update', 'change_orders:delete',
            'change_orders:read:all', 'change_orders:update:all', 'change_orders:delete:all'
        ]) AS permission_name
    )
    SELECT
        split_part(rp.permission_name, ':', 1) AS entity,
        split_part(rp.permission_name, ':', 2) AS operation,
        public.has_permission(v_user_id, rp.permission_name) AS has_permission
    FROM required_permissions rp
    ORDER BY entity, operation;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verify permissions for admin user
SELECT * FROM verify_user_permissions('nayib@finalroofingcompany.com');

-- Test CRUD operations for admin user
DO $$
DECLARE
    v_user_id uuid;
    v_lead_id uuid;
    v_customer_id uuid;
BEGIN
    -- Get admin user ID
    SELECT id INTO v_user_id
    FROM auth.users
    WHERE email = 'nayib@finalroofingcompany.com';

    -- Test lead operations
    INSERT INTO public.leads (
        first_name,
        last_name,
        email,
        user_id
    ) VALUES (
        'Test',
        'Lead',
        'test@example.com',
        v_user_id
    ) RETURNING id INTO v_lead_id;

    UPDATE public.leads
    SET notes = 'Updated by permission test'
    WHERE id = v_lead_id;

    DELETE FROM public.leads
    WHERE id = v_lead_id;

    -- Test customer operations
    INSERT INTO public.customers (
        first_name,
        last_name,
        email,
        user_id
    ) VALUES (
        'Test',
        'Customer',
        'test@example.com',
        v_user_id
    ) RETURNING id INTO v_customer_id;

    UPDATE public.customers
    SET notes = 'Updated by permission test'
    WHERE id = v_customer_id;

    DELETE FROM public.customers
    WHERE id = v_customer_id;

    RAISE NOTICE 'All CRUD operations completed successfully';
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'CRUD test failed: %', SQLERRM;
END $$;
