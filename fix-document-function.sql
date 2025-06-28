-- Fix for missing generate_document_number function
-- This function is required for invoice creation

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

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.generate_document_number() TO authenticated;
GRANT EXECUTE ON FUNCTION public.generate_document_number() TO anon;
GRANT EXECUTE ON FUNCTION public.generate_document_number() TO public;

-- Test the function
SELECT generate_document_number() as test_result;
