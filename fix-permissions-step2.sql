-- Create admin_permissions table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.admin_permissions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    permission_name text NOT NULL UNIQUE,
    description text,
    created_at timestamptz DEFAULT now()
);

-- Create user_permissions table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_permissions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id),
    permission_name text REFERENCES admin_permissions(permission_name),
    granted_at timestamptz DEFAULT now(),
    granted_by uuid REFERENCES auth.users(id),
    UNIQUE(user_id, permission_name)
);

-- Insert all required permissions
INSERT INTO public.admin_permissions (permission_name, description)
VALUES
    ('leads:create', 'Can create leads'),
    ('leads:read', 'Can read leads'),
    ('leads:update', 'Can update leads'),
    ('leads:delete', 'Can delete leads'),
    ('leads:read:all', 'Can read all leads'),
    ('leads:update:all', 'Can update all leads'),
    ('leads:delete:all', 'Can delete all leads'),
    ('customers:create', 'Can create customers'),
    ('customers:read', 'Can read customers'),
    ('customers:update', 'Can update customers'),
    ('customers:delete', 'Can delete customers'),
    ('customers:read:all', 'Can read all customers'),
    ('customers:update:all', 'Can update all customers'),
    ('customers:delete:all', 'Can delete all customers'),
    ('jobs:create', 'Can create jobs'),
    ('jobs:read', 'Can read jobs'),
    ('jobs:update', 'Can update jobs'),
    ('jobs:delete', 'Can delete jobs'),
    ('jobs:read:all', 'Can read all jobs'),
    ('jobs:update:all', 'Can update all jobs'),
    ('jobs:delete:all', 'Can delete all jobs'),
    ('estimates:create', 'Can create estimates'),
    ('estimates:read', 'Can read estimates'),
    ('estimates:update', 'Can update estimates'),
    ('estimates:delete', 'Can delete estimates'),
    ('estimates:read:all', 'Can read all estimates'),
    ('estimates:update:all', 'Can update all estimates'),
    ('estimates:delete:all', 'Can delete all estimates'),
    ('invoices:create', 'Can create invoices'),
    ('invoices:read', 'Can read invoices'),
    ('invoices:update', 'Can update invoices'),
    ('invoices:delete', 'Can delete invoices'),
    ('invoices:read:all', 'Can read all invoices'),
    ('invoices:update:all', 'Can update all invoices'),
    ('invoices:delete:all', 'Can delete all invoices'),
    ('tasks:create', 'Can create tasks'),
    ('tasks:read', 'Can read tasks'),
    ('tasks:update', 'Can update tasks'),
    ('tasks:delete', 'Can delete tasks'),
    ('tasks:read:all', 'Can read all tasks'),
    ('tasks:update:all', 'Can update all tasks'),
    ('tasks:delete:all', 'Can delete all tasks'),
    ('time_entries:create', 'Can create time entries'),
    ('time_entries:read', 'Can read time entries'),
    ('time_entries:update', 'Can update time entries'),
    ('time_entries:delete', 'Can delete time entries'),
    ('time_entries:read:all', 'Can read all time entries'),
    ('time_entries:update:all', 'Can update all time entries'),
    ('time_entries:delete:all', 'Can delete all time entries'),
    ('change_orders:create', 'Can create change orders'),
    ('change_orders:read', 'Can read change orders'),
    ('change_orders:update', 'Can update change orders'),
    ('change_orders:delete', 'Can delete change orders'),
    ('change_orders:read:all', 'Can read all change orders'),
    ('change_orders:update:all', 'Can update all change orders'),
    ('change_orders:delete:all', 'Can delete all change orders')
ON CONFLICT (permission_name) DO NOTHING;

-- Grant all permissions to admin user
DO $$
DECLARE
    v_user_id uuid;
    v_permission record;
BEGIN
    -- Get admin user ID
    SELECT id INTO v_user_id
    FROM auth.users
    WHERE email = 'nayib@finalroofingcompany.com';

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Admin user not found';
    END IF;

    -- Grant all permissions
    FOR v_permission IN SELECT permission_name FROM public.admin_permissions
    LOOP
        INSERT INTO public.user_permissions (user_id, permission_name, granted_by)
        VALUES (v_user_id, v_permission.permission_name, v_user_id)
        ON CONFLICT (user_id, permission_name) DO NOTHING;
    END LOOP;
END $$;
