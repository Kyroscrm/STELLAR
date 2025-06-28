-- COMPREHENSIVE PERMISSIONS FIX FOR STELLAR CRM
-- This script will fix all permission issues for nayib@finalroofingcompany.com

-- ===== STEP 1: Create missing generate_document_number function =====
CREATE OR REPLACE FUNCTION public.generate_document_number()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Generate a simple timestamp-based document number
    RETURN 'DOC-' || to_char(now(), 'YYYYMMDD') || '-' || extract(epoch from now())::bigint;
END;
$$;

-- Grant execute permission to all users
GRANT EXECUTE ON FUNCTION public.generate_document_number() TO authenticated;
GRANT EXECUTE ON FUNCTION public.generate_document_number() TO anon;
GRANT EXECUTE ON FUNCTION public.generate_document_number() TO public;

-- ===== STEP 2: Drop any existing conflicting policies =====
DROP POLICY IF EXISTS "Admin access leads" ON public.leads;
DROP POLICY IF EXISTS "Admin access jobs" ON public.jobs;
DROP POLICY IF EXISTS "Admin access estimates" ON public.estimates;
DROP POLICY IF EXISTS "Admin access invoices" ON public.invoices;
DROP POLICY IF EXISTS "Admin access tasks" ON public.tasks;
DROP POLICY IF EXISTS "Admin access customers" ON public.customers;

-- Also drop any other potential policies that might exist
DROP POLICY IF EXISTS "leads_policy" ON public.leads;
DROP POLICY IF EXISTS "jobs_policy" ON public.jobs;
DROP POLICY IF EXISTS "estimates_policy" ON public.estimates;
DROP POLICY IF EXISTS "invoices_policy" ON public.invoices;
DROP POLICY IF EXISTS "tasks_policy" ON public.tasks;
DROP POLICY IF EXISTS "customers_policy" ON public.customers;

-- ===== STEP 3: Create comprehensive admin policies for ALL tables =====

-- Leads table policy
CREATE POLICY "Admin access leads" ON public.leads
FOR ALL USING ((auth.jwt() ->> 'email'::text) = 'nayib@finalroofingcompany.com'::text);

-- Jobs table policy
CREATE POLICY "Admin access jobs" ON public.jobs
FOR ALL USING ((auth.jwt() ->> 'email'::text) = 'nayib@finalroofingcompany.com'::text);

-- Estimates table policy
CREATE POLICY "Admin access estimates" ON public.estimates
FOR ALL USING ((auth.jwt() ->> 'email'::text) = 'nayib@finalroofingcompany.com'::text);

-- Invoices table policy
CREATE POLICY "Admin access invoices" ON public.invoices
FOR ALL USING ((auth.jwt() ->> 'email'::text) = 'nayib@finalroofingcompany.com'::text);

-- Tasks table policy
CREATE POLICY "Admin access tasks" ON public.tasks
FOR ALL USING ((auth.jwt() ->> 'email'::text) = 'nayib@finalroofingcompany.com'::text);

-- Customers table policy (recreate to ensure consistency)
CREATE POLICY "Admin access customers" ON public.customers
FOR ALL USING ((auth.jwt() ->> 'email'::text) = 'nayib@finalroofingcompany.com'::text);

-- ===== STEP 4: Enable RLS on all tables (in case it's disabled) =====
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estimates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- ===== STEP 5: Grant table permissions to authenticated users =====
GRANT ALL ON public.leads TO authenticated;
GRANT ALL ON public.jobs TO authenticated;
GRANT ALL ON public.estimates TO authenticated;
GRANT ALL ON public.invoices TO authenticated;
GRANT ALL ON public.tasks TO authenticated;
GRANT ALL ON public.customers TO authenticated;

-- Also grant to public role for broader access
GRANT SELECT, INSERT, UPDATE, DELETE ON public.leads TO public;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.jobs TO public;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.estimates TO public;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.invoices TO public;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tasks TO public;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.customers TO public;

-- ===== STEP 6: Additional admin-specific policies =====

-- Create backup admin policies using user ID as well
DO $$
DECLARE
    admin_user_id UUID;
BEGIN
    -- Get the admin user ID
    SELECT id INTO admin_user_id
    FROM auth.users
    WHERE email = 'nayib@finalroofingcompany.com'
    LIMIT 1;

    IF admin_user_id IS NOT NULL THEN
        -- Create additional policies using user ID
        EXECUTE format('CREATE POLICY "Admin ID access leads" ON public.leads FOR ALL USING (auth.uid() = %L)', admin_user_id);
        EXECUTE format('CREATE POLICY "Admin ID access jobs" ON public.jobs FOR ALL USING (auth.uid() = %L)', admin_user_id);
        EXECUTE format('CREATE POLICY "Admin ID access estimates" ON public.estimates FOR ALL USING (auth.uid() = %L)', admin_user_id);
        EXECUTE format('CREATE POLICY "Admin ID access invoices" ON public.invoices FOR ALL USING (auth.uid() = %L)', admin_user_id);
        EXECUTE format('CREATE POLICY "Admin ID access tasks" ON public.tasks FOR ALL USING (auth.uid() = %L)', admin_user_id);
        EXECUTE format('CREATE POLICY "Admin ID access customers" ON public.customers FOR ALL USING (auth.uid() = %L)', admin_user_id);
    END IF;
END
$$;

-- ===== STEP 7: Grant sequence permissions =====
-- Grant usage on all sequences to ensure ID generation works
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO public;

-- ===== STEP 8: Final verification =====
-- Enable RLS enforcement (force policies to be checked)
ALTER TABLE public.leads FORCE ROW LEVEL SECURITY;
ALTER TABLE public.jobs FORCE ROW LEVEL SECURITY;
ALTER TABLE public.estimates FORCE ROW LEVEL SECURITY;
ALTER TABLE public.invoices FORCE ROW LEVEL SECURITY;
ALTER TABLE public.tasks FORCE ROW LEVEL SECURITY;
ALTER TABLE public.customers FORCE ROW LEVEL SECURITY;

-- Success message
SELECT 'COMPREHENSIVE PERMISSIONS FIX COMPLETED SUCCESSFULLY' as status;
