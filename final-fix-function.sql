-- FINAL CORRECT FIX: Drop existing function and recreate with proper parameters
-- This handles the parameter name mismatch error

-- First, let's drop all possible variations of this function
DROP FUNCTION IF EXISTS public.generate_document_number();
DROP FUNCTION IF EXISTS public.generate_document_number(text);
DROP FUNCTION IF EXISTS public.generate_document_number(text, uuid);
DROP FUNCTION IF EXISTS public.generate_document_number(document_type text, user_uuid uuid);

-- Now create the function with the exact parameters the frontend expects
CREATE OR REPLACE FUNCTION public.generate_document_number(
    doc_type TEXT DEFAULT 'doc',
    user_uuid UUID DEFAULT NULL
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Generate document number based on type
    CASE doc_type
        WHEN 'invoice' THEN
            RETURN 'INV-' || to_char(now(), 'YYYYMMDD') || '-' || extract(epoch from now())::bigint;
        WHEN 'estimate' THEN
            RETURN 'EST-' || to_char(now(), 'YYYYMMDD') || '-' || extract(epoch from now())::bigint;
        WHEN 'job' THEN
            RETURN 'JOB-' || to_char(now(), 'YYYYMMDD') || '-' || extract(epoch from now())::bigint;
        ELSE
            RETURN 'DOC-' || to_char(now(), 'YYYYMMDD') || '-' || extract(epoch from now())::bigint;
    END CASE;
END;
$$;

-- Grant execute permissions to all roles
GRANT EXECUTE ON FUNCTION public.generate_document_number(TEXT, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.generate_document_number(TEXT, UUID) TO anon;
GRANT EXECUTE ON FUNCTION public.generate_document_number(TEXT, UUID) TO public;
GRANT EXECUTE ON FUNCTION public.generate_document_number(TEXT, UUID) TO service_role;

-- Ensure the function owner is correct
ALTER FUNCTION public.generate_document_number(TEXT, UUID) OWNER TO postgres;

-- Test the function with the exact parameters the frontend sends
SELECT generate_document_number('invoice', '550e8400-e29b-41d4-a716-446655440000'::uuid) as test_invoice_result;
