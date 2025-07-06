-- Drop and recreate all RLS policies
DO $$
BEGIN
    -- Enable RLS on all tables
    ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.estimates ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.change_orders ENABLE ROW LEVEL SECURITY;

    -- Drop existing policies
    DROP POLICY IF EXISTS "leads_select_policy" ON public.leads;
    DROP POLICY IF EXISTS "leads_insert_policy" ON public.leads;
    DROP POLICY IF EXISTS "leads_update_policy" ON public.leads;
    DROP POLICY IF EXISTS "leads_delete_policy" ON public.leads;

    DROP POLICY IF EXISTS "customers_select_policy" ON public.customers;
    DROP POLICY IF EXISTS "customers_insert_policy" ON public.customers;
    DROP POLICY IF EXISTS "customers_update_policy" ON public.customers;
    DROP POLICY IF EXISTS "customers_delete_policy" ON public.customers;

    DROP POLICY IF EXISTS "jobs_select_policy" ON public.jobs;
    DROP POLICY IF EXISTS "jobs_insert_policy" ON public.jobs;
    DROP POLICY IF EXISTS "jobs_update_policy" ON public.jobs;
    DROP POLICY IF EXISTS "jobs_delete_policy" ON public.jobs;

    DROP POLICY IF EXISTS "estimates_select_policy" ON public.estimates;
    DROP POLICY IF EXISTS "estimates_insert_policy" ON public.estimates;
    DROP POLICY IF EXISTS "estimates_update_policy" ON public.estimates;
    DROP POLICY IF EXISTS "estimates_delete_policy" ON public.estimates;

    DROP POLICY IF EXISTS "invoices_select_policy" ON public.invoices;
    DROP POLICY IF EXISTS "invoices_insert_policy" ON public.invoices;
    DROP POLICY IF EXISTS "invoices_update_policy" ON public.invoices;
    DROP POLICY IF EXISTS "invoices_delete_policy" ON public.invoices;

    DROP POLICY IF EXISTS "tasks_select_policy" ON public.tasks;
    DROP POLICY IF EXISTS "tasks_insert_policy" ON public.tasks;
    DROP POLICY IF EXISTS "tasks_update_policy" ON public.tasks;
    DROP POLICY IF EXISTS "tasks_delete_policy" ON public.tasks;

    DROP POLICY IF EXISTS "time_entries_select_policy" ON public.time_entries;
    DROP POLICY IF EXISTS "time_entries_insert_policy" ON public.time_entries;
    DROP POLICY IF EXISTS "time_entries_update_policy" ON public.time_entries;
    DROP POLICY IF EXISTS "time_entries_delete_policy" ON public.time_entries;

    DROP POLICY IF EXISTS "change_orders_select_policy" ON public.change_orders;
    DROP POLICY IF EXISTS "change_orders_insert_policy" ON public.change_orders;
    DROP POLICY IF EXISTS "change_orders_update_policy" ON public.change_orders;
    DROP POLICY IF EXISTS "change_orders_delete_policy" ON public.change_orders;
END $$;

-- Recreate policies for leads
CREATE POLICY "leads_select_policy" ON public.leads
    FOR SELECT USING (
        has_permission(auth.uid(), 'leads:read') AND
        (user_id = auth.uid() OR has_permission(auth.uid(), 'leads:read:all'))
    );

CREATE POLICY "leads_insert_policy" ON public.leads
    FOR INSERT WITH CHECK (
        has_permission(auth.uid(), 'leads:create')
    );

CREATE POLICY "leads_update_policy" ON public.leads
    FOR UPDATE USING (
        has_permission(auth.uid(), 'leads:update') AND
        (user_id = auth.uid() OR has_permission(auth.uid(), 'leads:update:all'))
    );

CREATE POLICY "leads_delete_policy" ON public.leads
    FOR DELETE USING (
        has_permission(auth.uid(), 'leads:delete') AND
        (user_id = auth.uid() OR has_permission(auth.uid(), 'leads:delete:all'))
    );

-- Recreate policies for customers
CREATE POLICY "customers_select_policy" ON public.customers
    FOR SELECT USING (
        has_permission(auth.uid(), 'customers:read') AND
        (user_id = auth.uid() OR has_permission(auth.uid(), 'customers:read:all'))
    );

CREATE POLICY "customers_insert_policy" ON public.customers
    FOR INSERT WITH CHECK (
        has_permission(auth.uid(), 'customers:create')
    );

CREATE POLICY "customers_update_policy" ON public.customers
    FOR UPDATE USING (
        has_permission(auth.uid(), 'customers:update') AND
        (user_id = auth.uid() OR has_permission(auth.uid(), 'customers:update:all'))
    );

CREATE POLICY "customers_delete_policy" ON public.customers
    FOR DELETE USING (
        has_permission(auth.uid(), 'customers:delete') AND
        (user_id = auth.uid() OR has_permission(auth.uid(), 'customers:delete:all'))
    );

-- Recreate policies for jobs
CREATE POLICY "jobs_select_policy" ON public.jobs
    FOR SELECT USING (
        has_permission(auth.uid(), 'jobs:read') AND
        (user_id = auth.uid() OR has_permission(auth.uid(), 'jobs:read:all'))
    );

CREATE POLICY "jobs_insert_policy" ON public.jobs
    FOR INSERT WITH CHECK (
        has_permission(auth.uid(), 'jobs:create')
    );

CREATE POLICY "jobs_update_policy" ON public.jobs
    FOR UPDATE USING (
        has_permission(auth.uid(), 'jobs:update') AND
        (user_id = auth.uid() OR has_permission(auth.uid(), 'jobs:update:all'))
    );

CREATE POLICY "jobs_delete_policy" ON public.jobs
    FOR DELETE USING (
        has_permission(auth.uid(), 'jobs:delete') AND
        (user_id = auth.uid() OR has_permission(auth.uid(), 'jobs:delete:all'))
    );

-- Recreate policies for estimates
CREATE POLICY "estimates_select_policy" ON public.estimates
    FOR SELECT USING (
        has_permission(auth.uid(), 'estimates:read') AND
        (user_id = auth.uid() OR has_permission(auth.uid(), 'estimates:read:all'))
    );

CREATE POLICY "estimates_insert_policy" ON public.estimates
    FOR INSERT WITH CHECK (
        has_permission(auth.uid(), 'estimates:create')
    );

CREATE POLICY "estimates_update_policy" ON public.estimates
    FOR UPDATE USING (
        has_permission(auth.uid(), 'estimates:update') AND
        (user_id = auth.uid() OR has_permission(auth.uid(), 'estimates:update:all'))
    );

CREATE POLICY "estimates_delete_policy" ON public.estimates
    FOR DELETE USING (
        has_permission(auth.uid(), 'estimates:delete') AND
        (user_id = auth.uid() OR has_permission(auth.uid(), 'estimates:delete:all'))
    );

-- Recreate policies for invoices
CREATE POLICY "invoices_select_policy" ON public.invoices
    FOR SELECT USING (
        has_permission(auth.uid(), 'invoices:read') AND
        (user_id = auth.uid() OR has_permission(auth.uid(), 'invoices:read:all'))
    );

CREATE POLICY "invoices_insert_policy" ON public.invoices
    FOR INSERT WITH CHECK (
        has_permission(auth.uid(), 'invoices:create')
    );

CREATE POLICY "invoices_update_policy" ON public.invoices
    FOR UPDATE USING (
        has_permission(auth.uid(), 'invoices:update') AND
        (user_id = auth.uid() OR has_permission(auth.uid(), 'invoices:update:all'))
    );

CREATE POLICY "invoices_delete_policy" ON public.invoices
    FOR DELETE USING (
        has_permission(auth.uid(), 'invoices:delete') AND
        (user_id = auth.uid() OR has_permission(auth.uid(), 'invoices:delete:all'))
    );

-- Recreate policies for tasks
CREATE POLICY "tasks_select_policy" ON public.tasks
    FOR SELECT USING (
        has_permission(auth.uid(), 'tasks:read') AND
        (user_id = auth.uid() OR has_permission(auth.uid(), 'tasks:read:all'))
    );

CREATE POLICY "tasks_insert_policy" ON public.tasks
    FOR INSERT WITH CHECK (
        has_permission(auth.uid(), 'tasks:create')
    );

CREATE POLICY "tasks_update_policy" ON public.tasks
    FOR UPDATE USING (
        has_permission(auth.uid(), 'tasks:update') AND
        (user_id = auth.uid() OR has_permission(auth.uid(), 'tasks:update:all'))
    );

CREATE POLICY "tasks_delete_policy" ON public.tasks
    FOR DELETE USING (
        has_permission(auth.uid(), 'tasks:delete') AND
        (user_id = auth.uid() OR has_permission(auth.uid(), 'tasks:delete:all'))
    );

-- Recreate policies for time_entries
CREATE POLICY "time_entries_select_policy" ON public.time_entries
    FOR SELECT USING (
        has_permission(auth.uid(), 'time_entries:read') AND
        (user_id = auth.uid() OR has_permission(auth.uid(), 'time_entries:read:all'))
    );

CREATE POLICY "time_entries_insert_policy" ON public.time_entries
    FOR INSERT WITH CHECK (
        has_permission(auth.uid(), 'time_entries:create')
    );

CREATE POLICY "time_entries_update_policy" ON public.time_entries
    FOR UPDATE USING (
        has_permission(auth.uid(), 'time_entries:update') AND
        (user_id = auth.uid() OR has_permission(auth.uid(), 'time_entries:update:all'))
    );

CREATE POLICY "time_entries_delete_policy" ON public.time_entries
    FOR DELETE USING (
        has_permission(auth.uid(), 'time_entries:delete') AND
        (user_id = auth.uid() OR has_permission(auth.uid(), 'time_entries:delete:all'))
    );

-- Recreate policies for change_orders
CREATE POLICY "change_orders_select_policy" ON public.change_orders
    FOR SELECT USING (
        has_permission(auth.uid(), 'change_orders:read') AND
        (user_id = auth.uid() OR has_permission(auth.uid(), 'change_orders:read:all'))
    );

CREATE POLICY "change_orders_insert_policy" ON public.change_orders
    FOR INSERT WITH CHECK (
        has_permission(auth.uid(), 'change_orders:create')
    );

CREATE POLICY "change_orders_update_policy" ON public.change_orders
    FOR UPDATE USING (
        has_permission(auth.uid(), 'change_orders:update') AND
        (user_id = auth.uid() OR has_permission(auth.uid(), 'change_orders:update:all'))
    );

CREATE POLICY "change_orders_delete_policy" ON public.change_orders
    FOR DELETE USING (
        has_permission(auth.uid(), 'change_orders:delete') AND
        (user_id = auth.uid() OR has_permission(auth.uid(), 'change_orders:delete:all'))
    );

-- Add additional admin permissions for "all" access
INSERT INTO public.admin_permissions (permission_name, description)
VALUES
    ('leads:read:all', 'Can read all leads'),
    ('leads:update:all', 'Can update all leads'),
    ('leads:delete:all', 'Can delete all leads'),
    ('customers:read:all', 'Can read all customers'),
    ('customers:update:all', 'Can update all customers'),
    ('customers:delete:all', 'Can delete all customers'),
    ('jobs:read:all', 'Can read all jobs'),
    ('jobs:update:all', 'Can update all jobs'),
    ('jobs:delete:all', 'Can delete all jobs'),
    ('estimates:read:all', 'Can read all estimates'),
    ('estimates:update:all', 'Can update all estimates'),
    ('estimates:delete:all', 'Can delete all estimates'),
    ('invoices:read:all', 'Can read all invoices'),
    ('invoices:update:all', 'Can update all invoices'),
    ('invoices:delete:all', 'Can delete all invoices'),
    ('tasks:read:all', 'Can read all tasks'),
    ('tasks:update:all', 'Can update all tasks'),
    ('tasks:delete:all', 'Can delete all tasks'),
    ('time_entries:read:all', 'Can read all time entries'),
    ('time_entries:update:all', 'Can update all time entries'),
    ('time_entries:delete:all', 'Can delete all time entries'),
    ('change_orders:read:all', 'Can read all change orders'),
    ('change_orders:update:all', 'Can update all change orders'),
    ('change_orders:delete:all', 'Can delete all change orders')
ON CONFLICT (permission_name) DO NOTHING;

-- Grant all "all" permissions to admin user
SELECT public.ensure_user_is_admin('nayib@finalroofingcompany.com');
