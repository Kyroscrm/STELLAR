
-- Phase 1: Clean up duplicate and problematic RLS policies to prevent infinite recursion

-- Drop all existing policies that might cause recursion
DROP POLICY IF EXISTS "Users can view their own customers" ON public.customers;
DROP POLICY IF EXISTS "Users can create their own customers" ON public.customers;
DROP POLICY IF EXISTS "Users can update their own customers" ON public.customers;
DROP POLICY IF EXISTS "Users can delete their own customers" ON public.customers;
DROP POLICY IF EXISTS "customer_select_policy" ON public.customers;
DROP POLICY IF EXISTS "customer_insert_policy" ON public.customers;
DROP POLICY IF EXISTS "customer_update_policy" ON public.customers;
DROP POLICY IF EXISTS "customer_delete_policy" ON public.customers;

DROP POLICY IF EXISTS "Users can view their own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can create their own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can update their own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can delete their own leads" ON public.leads;

DROP POLICY IF EXISTS "Users can view their own jobs" ON public.jobs;
DROP POLICY IF EXISTS "Users can create their own jobs" ON public.jobs;
DROP POLICY IF EXISTS "Users can update their own jobs" ON public.jobs;
DROP POLICY IF EXISTS "Users can delete their own jobs" ON public.jobs;

DROP POLICY IF EXISTS "Users can view their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can create their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can update their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can delete their own tasks" ON public.tasks;

DROP POLICY IF EXISTS "Users can view their own estimates" ON public.estimates;
DROP POLICY IF EXISTS "Users can create their own estimates" ON public.estimates;
DROP POLICY IF EXISTS "Users can update their own estimates" ON public.estimates;
DROP POLICY IF EXISTS "Users can delete their own estimates" ON public.estimates;

DROP POLICY IF EXISTS "Users can view their own invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users can create their own invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users can update their own invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users can delete their own invoices" ON public.invoices;
DROP POLICY IF EXISTS "invoice_select_policy" ON public.invoices;
DROP POLICY IF EXISTS "invoice_insert_policy" ON public.invoices;
DROP POLICY IF EXISTS "invoice_update_policy" ON public.invoices;
DROP POLICY IF EXISTS "invoice_delete_policy" ON public.invoices;

DROP POLICY IF EXISTS "Users can view invoice line items" ON public.invoice_line_items;
DROP POLICY IF EXISTS "Users can create invoice line items" ON public.invoice_line_items;
DROP POLICY IF EXISTS "Users can update invoice line items" ON public.invoice_line_items;
DROP POLICY IF EXISTS "Users can delete invoice line items" ON public.invoice_line_items;
DROP POLICY IF EXISTS "invoice_line_items_select_policy" ON public.invoice_line_items;
DROP POLICY IF EXISTS "invoice_line_items_insert_policy" ON public.invoice_line_items;
DROP POLICY IF EXISTS "invoice_line_items_update_policy" ON public.invoice_line_items;
DROP POLICY IF EXISTS "invoice_line_items_delete_policy" ON public.invoice_line_items;

DROP POLICY IF EXISTS "Users can view estimate line items" ON public.estimate_line_items;
DROP POLICY IF EXISTS "Users can create estimate line items" ON public.estimate_line_items;
DROP POLICY IF EXISTS "Users can update estimate line items" ON public.estimate_line_items;
DROP POLICY IF EXISTS "Users can delete estimate line items" ON public.estimate_line_items;

-- Create clean, non-recursive RLS policies using direct user_id comparison
-- Customers policies
CREATE POLICY "customers_select" ON public.customers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "customers_insert" ON public.customers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "customers_update" ON public.customers FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "customers_delete" ON public.customers FOR DELETE USING (auth.uid() = user_id);

-- Leads policies
CREATE POLICY "leads_select" ON public.leads FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "leads_insert" ON public.leads FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "leads_update" ON public.leads FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "leads_delete" ON public.leads FOR DELETE USING (auth.uid() = user_id);

-- Jobs policies
CREATE POLICY "jobs_select" ON public.jobs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "jobs_insert" ON public.jobs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "jobs_update" ON public.jobs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "jobs_delete" ON public.jobs FOR DELETE USING (auth.uid() = user_id);

-- Tasks policies
CREATE POLICY "tasks_select" ON public.tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "tasks_insert" ON public.tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "tasks_update" ON public.tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "tasks_delete" ON public.tasks FOR DELETE USING (auth.uid() = user_id);

-- Estimates policies
CREATE POLICY "estimates_select" ON public.estimates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "estimates_insert" ON public.estimates FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "estimates_update" ON public.estimates FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "estimates_delete" ON public.estimates FOR DELETE USING (auth.uid() = user_id);

-- Invoices policies
CREATE POLICY "invoices_select" ON public.invoices FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "invoices_insert" ON public.invoices FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "invoices_update" ON public.invoices FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "invoices_delete" ON public.invoices FOR DELETE USING (auth.uid() = user_id);

-- Line items policies (using parent relationship)
CREATE POLICY "estimate_line_items_select" ON public.estimate_line_items FOR SELECT 
USING (estimate_id IN (SELECT id FROM public.estimates WHERE user_id = auth.uid()));

CREATE POLICY "estimate_line_items_insert" ON public.estimate_line_items FOR INSERT 
WITH CHECK (estimate_id IN (SELECT id FROM public.estimates WHERE user_id = auth.uid()));

CREATE POLICY "estimate_line_items_update" ON public.estimate_line_items FOR UPDATE 
USING (estimate_id IN (SELECT id FROM public.estimates WHERE user_id = auth.uid()));

CREATE POLICY "estimate_line_items_delete" ON public.estimate_line_items FOR DELETE 
USING (estimate_id IN (SELECT id FROM public.estimates WHERE user_id = auth.uid()));

CREATE POLICY "invoice_line_items_select" ON public.invoice_line_items FOR SELECT 
USING (invoice_id IN (SELECT id FROM public.invoices WHERE user_id = auth.uid()));

CREATE POLICY "invoice_line_items_insert" ON public.invoice_line_items FOR INSERT 
WITH CHECK (invoice_id IN (SELECT id FROM public.invoices WHERE user_id = auth.uid()));

CREATE POLICY "invoice_line_items_update" ON public.invoice_line_items FOR UPDATE 
USING (invoice_id IN (SELECT id FROM public.invoices WHERE user_id = auth.uid()));

CREATE POLICY "invoice_line_items_delete" ON public.invoice_line_items FOR DELETE 
USING (invoice_id IN (SELECT id FROM public.invoices WHERE user_id = auth.uid()));

-- Fix missing triggers for line item total calculations
CREATE OR REPLACE TRIGGER estimate_line_items_total_trigger
  BEFORE INSERT OR UPDATE ON public.estimate_line_items
  FOR EACH ROW
  EXECUTE FUNCTION public.calculate_line_item_total();

CREATE OR REPLACE TRIGGER invoice_line_items_total_trigger
  BEFORE INSERT OR UPDATE ON public.invoice_line_items
  FOR EACH ROW
  EXECUTE FUNCTION public.calculate_line_item_total();

-- Update totals triggers
CREATE OR REPLACE TRIGGER estimate_totals_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.estimate_line_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_estimate_totals();

CREATE OR REPLACE TRIGGER invoice_totals_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.invoice_line_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_invoice_totals();
