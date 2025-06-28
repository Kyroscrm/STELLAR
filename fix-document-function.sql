-- Create the missing generate_document_number function
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

-- Grant execute permission to all authenticated users
GRANT EXECUTE ON FUNCTION public.generate_document_number() TO authenticated;
GRANT EXECUTE ON FUNCTION public.generate_document_number() TO anon;
