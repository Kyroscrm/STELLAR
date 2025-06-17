
-- Create client_portal_tokens table for magic link authentication
CREATE TABLE public.client_portal_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  token TEXT NOT NULL UNIQUE,
  customer_id UUID NOT NULL,
  user_id UUID NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Add foreign key constraints
ALTER TABLE public.client_portal_tokens 
ADD CONSTRAINT fk_client_portal_tokens_customer 
FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE CASCADE;

-- Enable RLS on client_portal_tokens
ALTER TABLE public.client_portal_tokens ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for client_portal_tokens
CREATE POLICY "client_portal_tokens_select_policy" 
  ON public.client_portal_tokens 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "client_portal_tokens_insert_policy" 
  ON public.client_portal_tokens 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "client_portal_tokens_update_policy" 
  ON public.client_portal_tokens 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "client_portal_tokens_delete_policy" 
  ON public.client_portal_tokens 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Add client portal access policies for customers to view their own data
CREATE POLICY "customers_client_portal_access" 
  ON public.customers 
  FOR SELECT 
  USING (
    auth.uid() IN (
      SELECT user_id FROM public.client_portal_tokens 
      WHERE customer_id = customers.id 
      AND expires_at > now() 
      AND used_at IS NOT NULL
    )
  );

-- Add client portal access policies for jobs
CREATE POLICY "jobs_client_portal_access" 
  ON public.jobs 
  FOR SELECT 
  USING (
    customer_id IN (
      SELECT customer_id FROM public.client_portal_tokens 
      WHERE expires_at > now() 
      AND used_at IS NOT NULL
    )
  );

-- Add client portal access policies for estimates
CREATE POLICY "estimates_client_portal_access" 
  ON public.estimates 
  FOR SELECT 
  USING (
    customer_id IN (
      SELECT customer_id FROM public.client_portal_tokens 
      WHERE expires_at > now() 
      AND used_at IS NOT NULL
    )
  );

-- Add client portal access policies for invoices
CREATE POLICY "invoices_client_portal_access" 
  ON public.invoices 
  FOR SELECT 
  USING (
    customer_id IN (
      SELECT customer_id FROM public.client_portal_tokens 
      WHERE expires_at > now() 
      AND used_at IS NOT NULL
    )
  );

-- Add client portal access policies for documents
CREATE POLICY "documents_client_portal_access" 
  ON public.documents 
  FOR SELECT 
  USING (
    entity_id IN (
      SELECT id FROM public.jobs 
      WHERE customer_id IN (
        SELECT customer_id FROM public.client_portal_tokens 
        WHERE expires_at > now() 
        AND used_at IS NOT NULL
      )
    )
    OR entity_id IN (
      SELECT id FROM public.estimates 
      WHERE customer_id IN (
        SELECT customer_id FROM public.client_portal_tokens 
        WHERE expires_at > now() 
        AND used_at IS NOT NULL
      )
    )
    OR entity_id IN (
      SELECT id FROM public.invoices 
      WHERE customer_id IN (
        SELECT customer_id FROM public.client_portal_tokens 
        WHERE expires_at > now() 
        AND used_at IS NOT NULL
      )
    )
  );

-- Create function to generate secure tokens
CREATE OR REPLACE FUNCTION public.generate_client_portal_token(
  p_customer_id UUID,
  p_user_id UUID,
  p_expires_hours INTEGER DEFAULT 168 -- 7 days default
) 
RETURNS TEXT 
LANGUAGE plpgsql 
SECURITY DEFINER
AS $$
DECLARE
  v_token TEXT;
BEGIN
  -- Generate a secure random token
  v_token := encode(gen_random_bytes(32), 'base64url');
  
  -- Insert the token
  INSERT INTO public.client_portal_tokens (
    token,
    customer_id,
    user_id,
    expires_at
  ) VALUES (
    v_token,
    p_customer_id,
    p_user_id,
    now() + (p_expires_hours || ' hours')::interval
  );
  
  RETURN v_token;
END;
$$;

-- Create function to validate and use token
CREATE OR REPLACE FUNCTION public.validate_client_portal_token(
  p_token TEXT
) 
RETURNS TABLE (
  customer_id UUID,
  user_id UUID,
  is_valid BOOLEAN
)
LANGUAGE plpgsql 
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cpt.customer_id,
    cpt.user_id,
    (cpt.expires_at > now() AND cpt.used_at IS NULL) as is_valid
  FROM public.client_portal_tokens cpt
  WHERE cpt.token = p_token;
  
  -- Mark token as used if valid
  UPDATE public.client_portal_tokens 
  SET used_at = now()
  WHERE token = p_token 
  AND expires_at > now() 
  AND used_at IS NULL;
END;
$$;
