
-- Comprehensive CRM Fix - Clean RLS Policies and Fix Core Issues
-- This migration will clean up duplicate policies and fix all identified issues

-- =======================
-- PHASE 1: CLEAN UP DUPLICATE RLS POLICIES
-- =======================

-- Drop all existing RLS policies to start fresh and avoid infinite recursion
-- We'll recreate only the necessary ones with proper structure

-- Customers table policies cleanup
DROP POLICY IF EXISTS "Users can view their own customers" ON public.customers;
DROP POLICY IF EXISTS "Users can create their own customers" ON public.customers;
DROP POLICY IF EXISTS "Users can update their own customers" ON public.customers;
DROP POLICY IF EXISTS "Users can delete their own customers" ON public.customers;

-- Leads table policies cleanup
DROP POLICY IF EXISTS "Users can view their own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can create their own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can update their own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can delete their own leads" ON public.leads;

-- Jobs table policies cleanup
DROP POLICY IF EXISTS "Users can view their own jobs" ON public.jobs;
DROP POLICY IF EXISTS "Users can create their own jobs" ON public.jobs;
DROP POLICY IF EXISTS "Users can update their own jobs" ON public.jobs;
DROP POLICY IF EXISTS "Users can delete their own jobs" ON public.jobs;

-- Tasks table policies cleanup
DROP POLICY IF EXISTS "Users can view their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can create their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can update their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can delete their own tasks" ON public.tasks;

-- Estimates table policies cleanup
DROP POLICY IF EXISTS "Users can view their own estimates" ON public.estimates;
DROP POLICY IF EXISTS "Users can create their own estimates" ON public.estimates;
DROP POLICY IF EXISTS "Users can update their own estimates" ON public.estimates;
DROP POLICY IF EXISTS "Users can delete their own estimates" ON public.estimates;

-- Invoices table policies cleanup
DROP POLICY IF EXISTS "Users can view their own invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users can create their own invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users can update their own invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users can delete their own invoices" ON public.invoices;

-- Estimate line items policies cleanup
DROP POLICY IF EXISTS "Users can view estimate line items" ON public.estimate_line_items;
DROP POLICY IF EXISTS "Users can create estimate line items" ON public.estimate_line_items;
DROP POLICY IF EXISTS "Users can update estimate line items" ON public.estimate_line_items;
DROP POLICY IF EXISTS "Users can delete estimate line items" ON public.estimate_line_items;

-- Invoice line items policies cleanup
DROP POLICY IF EXISTS "Users can view invoice line items" ON public.invoice_line_items;
DROP POLICY IF EXISTS "Users can create invoice line items" ON public.invoice_line_items;
DROP POLICY IF EXISTS "Users can update invoice line items" ON public.invoice_line_items;
DROP POLICY IF EXISTS "Users can delete invoice line items" ON public.invoice_line_items;

-- =======================
-- PHASE 2: CREATE CLEAN, NON-RECURSIVE RLS POLICIES
-- =======================

-- Customers table policies
CREATE POLICY "customers_select_policy" ON public.customers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "customers_insert_policy" ON public.customers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "customers_update_policy" ON public.customers
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "customers_delete_policy" ON public.customers
  FOR DELETE USING (auth.uid() = user_id);

-- Leads table policies
CREATE POLICY "leads_select_policy" ON public.leads
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "leads_insert_policy" ON public.leads
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "leads_update_policy" ON public.leads
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "leads_delete_policy" ON public.leads
  FOR DELETE USING (auth.uid() = user_id);

-- Jobs table policies
CREATE POLICY "jobs_select_policy" ON public.jobs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "jobs_insert_policy" ON public.jobs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "jobs_update_policy" ON public.jobs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "jobs_delete_policy" ON public.jobs
  FOR DELETE USING (auth.uid() = user_id);

-- Tasks table policies
CREATE POLICY "tasks_select_policy" ON public.tasks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "tasks_insert_policy" ON public.tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "tasks_update_policy" ON public.tasks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "tasks_delete_policy" ON public.tasks
  FOR DELETE USING (auth.uid() = user_id);

-- Estimates table policies
CREATE POLICY "estimates_select_policy" ON public.estimates
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "estimates_insert_policy" ON public.estimates
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "estimates_update_policy" ON public.estimates
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "estimates_delete_policy" ON public.estimates
  FOR DELETE USING (auth.uid() = user_id);

-- Invoices table policies
CREATE POLICY "invoices_select_policy" ON public.invoices
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "invoices_insert_policy" ON public.invoices
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "invoices_update_policy" ON public.invoices
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "invoices_delete_policy" ON public.invoices
  FOR DELETE USING (auth.uid() = user_id);

-- Estimate line items policies (access through parent estimate)
CREATE POLICY "estimate_line_items_select_policy" ON public.estimate_line_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.estimates e 
      WHERE e.id = estimate_line_items.estimate_id 
      AND e.user_id = auth.uid()
    )
  );

CREATE POLICY "estimate_line_items_insert_policy" ON public.estimate_line_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.estimates e 
      WHERE e.id = estimate_line_items.estimate_id 
      AND e.user_id = auth.uid()
    )
  );

CREATE POLICY "estimate_line_items_update_policy" ON public.estimate_line_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.estimates e 
      WHERE e.id = estimate_line_items.estimate_id 
      AND e.user_id = auth.uid()
    )
  );

CREATE POLICY "estimate_line_items_delete_policy" ON public.estimate_line_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.estimates e 
      WHERE e.id = estimate_line_items.estimate_id 
      AND e.user_id = auth.uid()
    )
  );

-- Invoice line items policies (access through parent invoice)
CREATE POLICY "invoice_line_items_select_policy" ON public.invoice_line_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.invoices i 
      WHERE i.id = invoice_line_items.invoice_id 
      AND i.user_id = auth.uid()
    )
  );

CREATE POLICY "invoice_line_items_insert_policy" ON public.invoice_line_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.invoices i 
      WHERE i.id = invoice_line_items.invoice_id 
      AND i.user_id = auth.uid()
    )
  );

CREATE POLICY "invoice_line_items_update_policy" ON public.invoice_line_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.invoices i 
      WHERE i.id = invoice_line_items.invoice_id 
      AND i.user_id = auth.uid()
    )
  );

CREATE POLICY "invoice_line_items_delete_policy" ON public.invoice_line_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.invoices i 
      WHERE i.id = invoice_line_items.invoice_id 
      AND i.user_id = auth.uid()
    )
  );

-- =======================
-- PHASE 3: FIX DATABASE TRIGGERS AND FUNCTIONS
-- =======================

-- Fix estimate line item total calculation trigger
DROP TRIGGER IF EXISTS calculate_estimate_line_item_total ON public.estimate_line_items;
DROP TRIGGER IF EXISTS update_estimate_totals_trigger ON public.estimate_line_items;

CREATE TRIGGER calculate_estimate_line_item_total
  BEFORE INSERT OR UPDATE ON public.estimate_line_items
  FOR EACH ROW
  EXECUTE FUNCTION public.calculate_line_item_total();

CREATE TRIGGER update_estimate_totals_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.estimate_line_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_estimate_totals();

-- Fix invoice line item total calculation trigger
DROP TRIGGER IF EXISTS calculate_invoice_line_item_total ON public.invoice_line_items;
DROP TRIGGER IF EXISTS update_invoice_totals_trigger ON public.invoice_line_items;

CREATE TRIGGER calculate_invoice_line_item_total
  BEFORE INSERT OR UPDATE ON public.invoice_line_items
  FOR EACH ROW
  EXECUTE FUNCTION public.calculate_line_item_total();

CREATE TRIGGER update_invoice_totals_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.invoice_line_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_invoice_totals();

-- =======================
-- PHASE 4: ENSURE PROPER DEFAULT VALUES
-- =======================

-- Ensure invoice line items have proper defaults to avoid total column errors
ALTER TABLE public.invoice_line_items 
  ALTER COLUMN total SET DEFAULT 0;

-- Ensure estimate line items have proper defaults
ALTER TABLE public.estimate_line_items 
  ALTER COLUMN total SET DEFAULT 0;

-- Ensure invoices have proper defaults
ALTER TABLE public.invoices 
  ALTER COLUMN subtotal SET DEFAULT 0,
  ALTER COLUMN tax_amount SET DEFAULT 0,
  ALTER COLUMN total_amount SET DEFAULT 0;

-- Ensure estimates have proper defaults
ALTER TABLE public.estimates 
  ALTER COLUMN subtotal SET DEFAULT 0,
  ALTER COLUMN tax_amount SET DEFAULT 0,
  ALTER COLUMN total_amount SET DEFAULT 0;
