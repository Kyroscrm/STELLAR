-- FINAL FIX: generate_document_number function with correct parameters
-- This matches what the frontend is calling

-- Drop the old function
DROP FUNCTION IF EXISTS public.generate_document_number();

-- Create the function with the correct parameters that the frontend expects
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

-- Test the function with the parameters the frontend sends
SELECT generate_document_number('invoice', '550e8400-e29b-41d4-a716-446655440000'::uuid) as test_invoice;
SELECT generate_document_number('estimate', '550e8400-e29b-41d4-a716-446655440000'::uuid) as test_estimate;
SELECT generate_document_number('job', '550e8400-e29b-41d4-a716-446655440000'::uuid) as test_job;
