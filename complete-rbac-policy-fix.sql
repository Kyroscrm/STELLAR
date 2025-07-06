-- ===============================================
-- COMPREHENSIVE RBAC POLICY AUDIT AND FIX
-- Date: $(date)
-- Issues: CRUD operations blocked, admin permissions missing
-- ===============================================

-- STEP 1: Drop all existing policies to start fresh
-- This ensures no conflicting or duplicate policies

DO $$
DECLARE
    pol RECORD;
BEGIN
    -- Drop all policies on public tables
    FOR pol IN
        SELECT schemaname, tablename, policyname
        FROM pg_policies
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', pol.policyname, pol.schemaname, pol.tablename);
    END LOOP;
END $$;

-- STEP 2: Disable RLS temporarily to recreate policies
ALTER TABLE public.leads DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.estimates DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_entries DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.change_orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions DISABLE ROW LEVEL SECURITY;

-- STEP 3: Create admin functions for direct database access
CREATE OR REPLACE FUNCTION public.admin_execute_sql(query TEXT)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    result jsonb;
    user_email text;
BEGIN
    -- Get current user email
    SELECT email INTO user_email FROM auth.users WHERE id = auth.uid();

    -- Only allow admin user
    IF user_email != 'nayib@finalroofingcompany.com' THEN
        RAISE EXCEPTION 'Access denied. Admin only.';
    END IF;

    -- Execute the query and return result as jsonb
    EXECUTE query INTO result;
    RETURN result;
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.admin_execute_sql TO authenticated;

-- STEP 4: Create helper function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_email text;
    admin_role_id uuid;
    user_role_id uuid;
BEGIN
    -- Check if user is the admin email
    SELECT email INTO user_email FROM auth.users WHERE id = user_id;
    IF user_email = 'nayib@finalroofingcompany.com' THEN
        RETURN true;
    END IF;

    -- Check if user has admin role
    SELECT id INTO admin_role_id FROM public.roles WHERE name = 'admin' LIMIT 1;
    SELECT role_id INTO user_role_id FROM public.profiles WHERE id = user_id;

    RETURN user_role_id = admin_role_id;
END;
$$;

-- STEP 5: Ensure admin user exists in profiles
INSERT INTO public.profiles (id, email, role_id, first_name, last_name, created_at, updated_at)
SELECT
    auth.uid(),
    'nayib@finalroofingcompany.com',
    (SELECT id FROM public.roles WHERE name = 'admin' LIMIT 1),
    'Admin',
    'User',
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE email = 'nayib@finalroofingcompany.com'
)
AND EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'nayib@finalroofingcompany.com'
);

-- Update existing profile if it exists
UPDATE public.profiles
SET role_id = (SELECT id FROM public.roles WHERE name = 'admin' LIMIT 1)
WHERE email = 'nayib@finalroofingcompany.com';

-- STEP 6: Create comprehensive RLS policies for all tables

-- LEADS policies
CREATE POLICY "leads_select_policy" ON public.leads FOR SELECT
USING (
    public.is_admin(auth.uid()) OR
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "leads_insert_policy" ON public.leads FOR INSERT
WITH CHECK (
    public.is_admin(auth.uid()) OR
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "leads_update_policy" ON public.leads FOR UPDATE
USING (
    public.is_admin(auth.uid()) OR
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "leads_delete_policy" ON public.leads FOR DELETE
USING (
    public.is_admin(auth.uid()) OR
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid())
);

-- CUSTOMERS policies
CREATE POLICY "customers_select_policy" ON public.customers FOR SELECT
USING (
    public.is_admin(auth.uid()) OR
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "customers_insert_policy" ON public.customers FOR INSERT
WITH CHECK (
    public.is_admin(auth.uid()) OR
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "customers_update_policy" ON public.customers FOR UPDATE
USING (
    public.is_admin(auth.uid()) OR
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "customers_delete_policy" ON public.customers FOR DELETE
USING (
    public.is_admin(auth.uid()) OR
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid())
);

-- JOBS policies
CREATE POLICY "jobs_select_policy" ON public.jobs FOR SELECT
USING (
    public.is_admin(auth.uid()) OR
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "jobs_insert_policy" ON public.jobs FOR INSERT
WITH CHECK (
    public.is_admin(auth.uid()) OR
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "jobs_update_policy" ON public.jobs FOR UPDATE
USING (
    public.is_admin(auth.uid()) OR
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "jobs_delete_policy" ON public.jobs FOR DELETE
USING (
    public.is_admin(auth.uid()) OR
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid())
);

-- ESTIMATES policies
CREATE POLICY "estimates_select_policy" ON public.estimates FOR SELECT
USING (
    public.is_admin(auth.uid()) OR
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "estimates_insert_policy" ON public.estimates FOR INSERT
WITH CHECK (
    public.is_admin(auth.uid()) OR
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "estimates_update_policy" ON public.estimates FOR UPDATE
USING (
    public.is_admin(auth.uid()) OR
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "estimates_delete_policy" ON public.estimates FOR DELETE
USING (
    public.is_admin(auth.uid()) OR
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid())
);

-- INVOICES policies
CREATE POLICY "invoices_select_policy" ON public.invoices FOR SELECT
USING (
    public.is_admin(auth.uid()) OR
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "invoices_insert_policy" ON public.invoices FOR INSERT
WITH CHECK (
    public.is_admin(auth.uid()) OR
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "invoices_update_policy" ON public.invoices FOR UPDATE
USING (
    public.is_admin(auth.uid()) OR
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "invoices_delete_policy" ON public.invoices FOR DELETE
USING (
    public.is_admin(auth.uid()) OR
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid())
);

-- TASKS policies
CREATE POLICY "tasks_select_policy" ON public.tasks FOR SELECT
USING (
    public.is_admin(auth.uid()) OR
    assigned_to = auth.uid() OR
    created_by = auth.uid() OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "tasks_insert_policy" ON public.tasks FOR INSERT
WITH CHECK (
    public.is_admin(auth.uid()) OR
    assigned_to = auth.uid() OR
    created_by = auth.uid() OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "tasks_update_policy" ON public.tasks FOR UPDATE
USING (
    public.is_admin(auth.uid()) OR
    assigned_to = auth.uid() OR
    created_by = auth.uid() OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "tasks_delete_policy" ON public.tasks FOR DELETE
USING (
    public.is_admin(auth.uid()) OR
    assigned_to = auth.uid() OR
    created_by = auth.uid() OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid())
);

-- TIME_ENTRIES policies (fix for 400 errors)
CREATE POLICY "time_entries_select_policy" ON public.time_entries FOR SELECT
USING (
    public.is_admin(auth.uid()) OR
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "time_entries_insert_policy" ON public.time_entries FOR INSERT
WITH CHECK (
    public.is_admin(auth.uid()) OR
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "time_entries_update_policy" ON public.time_entries FOR UPDATE
USING (
    public.is_admin(auth.uid()) OR
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "time_entries_delete_policy" ON public.time_entries FOR DELETE
USING (
    public.is_admin(auth.uid()) OR
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid())
);

-- CHANGE_ORDERS policies (fix for system issues)
CREATE POLICY "change_orders_select_policy" ON public.change_orders FOR SELECT
USING (
    public.is_admin(auth.uid()) OR
    created_by = auth.uid() OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "change_orders_insert_policy" ON public.change_orders FOR INSERT
WITH CHECK (
    public.is_admin(auth.uid()) OR
    created_by = auth.uid() OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "change_orders_update_policy" ON public.change_orders FOR UPDATE
USING (
    public.is_admin(auth.uid()) OR
    created_by = auth.uid() OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "change_orders_delete_policy" ON public.change_orders FOR DELETE
USING (
    public.is_admin(auth.uid()) OR
    created_by = auth.uid() OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid())
);

-- SYSTEM tables - allow all authenticated users to read, admin to modify
CREATE POLICY "profiles_select_policy" ON public.profiles FOR SELECT
USING (
    public.is_admin(auth.uid()) OR
    id = auth.uid() OR
    true -- Allow reading all profiles for team functionality
);

CREATE POLICY "profiles_insert_policy" ON public.profiles FOR INSERT
WITH CHECK (
    public.is_admin(auth.uid()) OR
    id = auth.uid()
);

CREATE POLICY "profiles_update_policy" ON public.profiles FOR UPDATE
USING (
    public.is_admin(auth.uid()) OR
    id = auth.uid()
);

CREATE POLICY "profiles_delete_policy" ON public.profiles FOR DELETE
USING (public.is_admin(auth.uid()));

-- Allow reading roles and permissions for RBAC functionality
CREATE POLICY "roles_select_policy" ON public.roles FOR SELECT
USING (true);

CREATE POLICY "roles_insert_policy" ON public.roles FOR INSERT
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "roles_update_policy" ON public.roles FOR UPDATE
USING (public.is_admin(auth.uid()));

CREATE POLICY "roles_delete_policy" ON public.roles FOR DELETE
USING (public.is_admin(auth.uid()));

CREATE POLICY "permissions_select_policy" ON public.permissions FOR SELECT
USING (true);

CREATE POLICY "permissions_insert_policy" ON public.permissions FOR INSERT
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "permissions_update_policy" ON public.permissions FOR UPDATE
USING (public.is_admin(auth.uid()));

CREATE POLICY "permissions_delete_policy" ON public.permissions FOR DELETE
USING (public.is_admin(auth.uid()));

CREATE POLICY "role_permissions_select_policy" ON public.role_permissions FOR SELECT
USING (true);

CREATE POLICY "role_permissions_insert_policy" ON public.role_permissions FOR INSERT
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "role_permissions_update_policy" ON public.role_permissions FOR UPDATE
USING (public.is_admin(auth.uid()));

CREATE POLICY "role_permissions_delete_policy" ON public.role_permissions FOR DELETE
USING (public.is_admin(auth.uid()));

-- STEP 7: Re-enable RLS on all tables
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estimates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.change_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- STEP 8: Create additional functions for debugging and management
CREATE OR REPLACE FUNCTION public.get_user_info(user_email text DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    result jsonb;
    target_email text;
BEGIN
    -- Use provided email or current user's email
    IF user_email IS NULL THEN
        SELECT email INTO target_email FROM auth.users WHERE id = auth.uid();
    ELSE
        target_email := user_email;
    END IF;

    SELECT jsonb_build_object(
        'email', u.email,
        'user_id', u.id,
        'profile_exists', p.id IS NOT NULL,
        'role_name', r.name,
        'is_admin', public.is_admin(u.id),
        'created_at', u.created_at
    ) INTO result
    FROM auth.users u
    LEFT JOIN public.profiles p ON u.id = p.id
    LEFT JOIN public.roles r ON p.role_id = r.id
    WHERE u.email = target_email;

    RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_user_info TO authenticated;

-- STEP 9: Fix time tracking system by ensuring proper indexes and constraints
-- Add missing indexes for performance
CREATE INDEX IF NOT EXISTS idx_time_entries_user_id ON public.time_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_job_id ON public.time_entries(job_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_start_time ON public.time_entries(start_time);
CREATE INDEX IF NOT EXISTS idx_time_entries_status ON public.time_entries(status);

-- Add missing indexes for change orders
CREATE INDEX IF NOT EXISTS idx_change_orders_job_id ON public.change_orders(job_id);
CREATE INDEX IF NOT EXISTS idx_change_orders_created_by ON public.change_orders(created_by);
CREATE INDEX IF NOT EXISTS idx_change_orders_status ON public.change_orders(status);

-- STEP 10: Final verification
-- This will show the current user and admin status
SELECT
    'RBAC POLICY FIX COMPLETE' AS status,
    public.get_user_info('nayib@finalroofingcompany.com') AS admin_info,
    public.get_user_info() AS current_user_info;

-- Show policy count for verification
SELECT
    schemaname,
    tablename,
    COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY schemaname, tablename
ORDER BY tablename;
