-- COMPREHENSIVE FIX: Function permissions for generate_document_number
-- This will ensure the function is accessible via REST API

-- Drop and recreate the function with proper permissions
DROP FUNCTION IF EXISTS public.generate_document_number();

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

-- Grant execute permissions to all roles
GRANT EXECUTE ON FUNCTION public.generate_document_number() TO authenticated;
GRANT EXECUTE ON FUNCTION public.generate_document_number() TO anon;
GRANT EXECUTE ON FUNCTION public.generate_document_number() TO public;
GRANT EXECUTE ON FUNCTION public.generate_document_number() TO service_role;

-- Ensure the function owner is correct
ALTER FUNCTION public.generate_document_number() OWNER TO postgres;

-- Create RLS policy bypass for this function (if needed)
-- Note: SECURITY DEFINER should handle this, but let's be explicit

-- Test the function to ensure it works
SELECT generate_document_number() as test_result;
