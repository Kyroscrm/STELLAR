
-- Drop existing duplicate policies to prevent infinite recursion
DROP POLICY IF EXISTS "Users can view their own invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users can create their own invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users can update their own invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users can delete their own invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users can view their own customers" ON public.customers;
DROP POLICY IF EXISTS "Users can create their own customers" ON public.customers;
DROP POLICY IF EXISTS "Users can update their own customers" ON public.customers;
DROP POLICY IF EXISTS "Users can delete their own customers" ON public.customers;
DROP POLICY IF EXISTS "Users can view invoice line items" ON public.invoice_line_items;
DROP POLICY IF EXISTS "Users can create invoice line items" ON public.invoice_line_items;
DROP POLICY IF EXISTS "Users can update invoice line items" ON public.invoice_line_items;
DROP POLICY IF EXISTS "Users can delete invoice line items" ON public.invoice_line_items;

-- Add payment tracking fields to invoices table
ALTER TABLE public.invoices 
ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'unpaid',
ADD COLUMN IF NOT EXISTS stripe_session_id text,
ADD COLUMN IF NOT EXISTS paid_at timestamp with time zone;

-- Create optimized RLS policies using security definer functions
CREATE POLICY "invoice_select_policy" ON public.invoices
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "invoice_insert_policy" ON public.invoices
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "invoice_update_policy" ON public.invoices
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "invoice_delete_policy" ON public.invoices
  FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "customer_select_policy" ON public.customers
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "customer_insert_policy" ON public.customers
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "customer_update_policy" ON public.customers
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "customer_delete_policy" ON public.customers
  FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "invoice_line_items_select_policy" ON public.invoice_line_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.invoices 
      WHERE invoices.id = invoice_line_items.invoice_id 
      AND invoices.user_id = auth.uid()
    )
  );

CREATE POLICY "invoice_line_items_insert_policy" ON public.invoice_line_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.invoices 
      WHERE invoices.id = invoice_line_items.invoice_id 
      AND invoices.user_id = auth.uid()
    )
  );

CREATE POLICY "invoice_line_items_update_policy" ON public.invoice_line_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.invoices 
      WHERE invoices.id = invoice_line_items.invoice_id 
      AND invoices.user_id = auth.uid()
    )
  );

CREATE POLICY "invoice_line_items_delete_policy" ON public.invoice_line_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.invoices 
      WHERE invoices.id = invoice_line_items.invoice_id 
      AND invoices.user_id = auth.uid()
    )
  );
