-- Fix RLS permissions for all main tables
-- Admin access policies using email verification

-- Drop existing policies that might be conflicting
DROP POLICY IF EXISTS "Admin access leads" ON public.leads;
DROP POLICY IF EXISTS "Admin access jobs" ON public.jobs;
DROP POLICY IF EXISTS "Admin access estimates" ON public.estimates;
DROP POLICY IF EXISTS "Admin access invoices" ON public.invoices;
DROP POLICY IF EXISTS "Admin access tasks" ON public.tasks;

-- Create admin policies for all tables
CREATE POLICY "Admin access leads" ON public.leads
FOR ALL USING ((auth.jwt() ->> 'email'::text) = 'nayib@finalroofingcompany.com'::text);

CREATE POLICY "Admin access jobs" ON public.jobs
FOR ALL USING ((auth.jwt() ->> 'email'::text) = 'nayib@finalroofingcompany.com'::text);

CREATE POLICY "Admin access estimates" ON public.estimates
FOR ALL USING ((auth.jwt() ->> 'email'::text) = 'nayib@finalroofingcompany.com'::text);

CREATE POLICY "Admin access invoices" ON public.invoices
FOR ALL USING ((auth.jwt() ->> 'email'::text) = 'nayib@finalroofingcompany.com'::text);

CREATE POLICY "Admin access tasks" ON public.tasks
FOR ALL USING ((auth.jwt() ->> 'email'::text) = 'nayib@finalroofingcompany.com'::text);

-- Also create the missing generate_document_number function
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

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.generate_document_number() TO authenticated;
