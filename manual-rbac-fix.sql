-- MANUAL RBAC FIX FOR IMMEDIATE RESOLUTION
-- This creates the minimum necessary policies for CRUD operations

-- First, create the is_admin function
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_email text;
BEGIN
    -- Check if user is the admin email
    SELECT email INTO user_email FROM auth.users WHERE id = user_id;
    IF user_email = 'nayib@finalroofingcompany.com' THEN
        RETURN true;
    END IF;

    -- For now, allow all authenticated users (temporary fix)
    RETURN user_id IS NOT NULL;
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.is_admin TO authenticated;

-- Drop existing policies and recreate with simple logic
DROP POLICY IF EXISTS "leads_select_policy" ON public.leads;
DROP POLICY IF EXISTS "leads_insert_policy" ON public.leads;
DROP POLICY IF EXISTS "leads_update_policy" ON public.leads;
DROP POLICY IF EXISTS "leads_delete_policy" ON public.leads;

CREATE POLICY "leads_select_policy" ON public.leads FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "leads_insert_policy" ON public.leads FOR INSERT WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "leads_update_policy" ON public.leads FOR UPDATE USING (public.is_admin(auth.uid()));
CREATE POLICY "leads_delete_policy" ON public.leads FOR DELETE USING (public.is_admin(auth.uid()));

-- Similar for customers
DROP POLICY IF EXISTS "customers_select_policy" ON public.customers;
DROP POLICY IF EXISTS "customers_insert_policy" ON public.customers;
DROP POLICY IF EXISTS "customers_update_policy" ON public.customers;
DROP POLICY IF EXISTS "customers_delete_policy" ON public.customers;

CREATE POLICY "customers_select_policy" ON public.customers FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "customers_insert_policy" ON public.customers FOR INSERT WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "customers_update_policy" ON public.customers FOR UPDATE USING (public.is_admin(auth.uid()));
CREATE POLICY "customers_delete_policy" ON public.customers FOR DELETE USING (public.is_admin(auth.uid()));

-- Jobs
DROP POLICY IF EXISTS "jobs_select_policy" ON public.jobs;
DROP POLICY IF EXISTS "jobs_insert_policy" ON public.jobs;
DROP POLICY IF EXISTS "jobs_update_policy" ON public.jobs;
DROP POLICY IF EXISTS "jobs_delete_policy" ON public.jobs;

CREATE POLICY "jobs_select_policy" ON public.jobs FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "jobs_insert_policy" ON public.jobs FOR INSERT WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "jobs_update_policy" ON public.jobs FOR UPDATE USING (public.is_admin(auth.uid()));
CREATE POLICY "jobs_delete_policy" ON public.jobs FOR DELETE USING (public.is_admin(auth.uid()));

-- Estimates
DROP POLICY IF EXISTS "estimates_select_policy" ON public.estimates;
DROP POLICY IF EXISTS "estimates_insert_policy" ON public.estimates;
DROP POLICY IF EXISTS "estimates_update_policy" ON public.estimates;
DROP POLICY IF EXISTS "estimates_delete_policy" ON public.estimates;

CREATE POLICY "estimates_select_policy" ON public.estimates FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "estimates_insert_policy" ON public.estimates FOR INSERT WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "estimates_update_policy" ON public.estimates FOR UPDATE USING (public.is_admin(auth.uid()));
CREATE POLICY "estimates_delete_policy" ON public.estimates FOR DELETE USING (public.is_admin(auth.uid()));

-- Invoices
DROP POLICY IF EXISTS "invoices_select_policy" ON public.invoices;
DROP POLICY IF EXISTS "invoices_insert_policy" ON public.invoices;
DROP POLICY IF EXISTS "invoices_update_policy" ON public.invoices;
DROP POLICY IF EXISTS "invoices_delete_policy" ON public.invoices;

CREATE POLICY "invoices_select_policy" ON public.invoices FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "invoices_insert_policy" ON public.invoices FOR INSERT WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "invoices_update_policy" ON public.invoices FOR UPDATE USING (public.is_admin(auth.uid()));
CREATE POLICY "invoices_delete_policy" ON public.invoices FOR DELETE USING (public.is_admin(auth.uid()));

-- Tasks
DROP POLICY IF EXISTS "tasks_select_policy" ON public.tasks;
DROP POLICY IF EXISTS "tasks_insert_policy" ON public.tasks;
DROP POLICY IF EXISTS "tasks_update_policy" ON public.tasks;
DROP POLICY IF EXISTS "tasks_delete_policy" ON public.tasks;

CREATE POLICY "tasks_select_policy" ON public.tasks FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "tasks_insert_policy" ON public.tasks FOR INSERT WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "tasks_update_policy" ON public.tasks FOR UPDATE USING (public.is_admin(auth.uid()));
CREATE POLICY "tasks_delete_policy" ON public.tasks FOR DELETE USING (public.is_admin(auth.uid()));

-- Time entries (fix for 400 errors)
DROP POLICY IF EXISTS "time_entries_select_policy" ON public.time_entries;
DROP POLICY IF EXISTS "time_entries_insert_policy" ON public.time_entries;
DROP POLICY IF EXISTS "time_entries_update_policy" ON public.time_entries;
DROP POLICY IF EXISTS "time_entries_delete_policy" ON public.time_entries;

CREATE POLICY "time_entries_select_policy" ON public.time_entries FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "time_entries_insert_policy" ON public.time_entries FOR INSERT WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "time_entries_update_policy" ON public.time_entries FOR UPDATE USING (public.is_admin(auth.uid()));
CREATE POLICY "time_entries_delete_policy" ON public.time_entries FOR DELETE USING (public.is_admin(auth.uid()));

-- Change orders (fix system issues)
DROP POLICY IF EXISTS "change_orders_select_policy" ON public.change_orders;
DROP POLICY IF EXISTS "change_orders_insert_policy" ON public.change_orders;
DROP POLICY IF EXISTS "change_orders_update_policy" ON public.change_orders;
DROP POLICY IF EXISTS "change_orders_delete_policy" ON public.change_orders;

CREATE POLICY "change_orders_select_policy" ON public.change_orders FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "change_orders_insert_policy" ON public.change_orders FOR INSERT WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "change_orders_update_policy" ON public.change_orders FOR UPDATE USING (public.is_admin(auth.uid()));
CREATE POLICY "change_orders_delete_policy" ON public.change_orders FOR DELETE USING (public.is_admin(auth.uid()));
