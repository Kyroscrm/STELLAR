
-- Phase 1: Drop all problematic policies that cause recursion or are duplicates

-- Drop the dangerous estimates policy that queries profiles directly
DROP POLICY IF EXISTS "Admin full access to estimates" ON public.estimates;

-- Drop duplicate/problematic policies on other tables
DROP POLICY IF EXISTS "Users can manage their own customers" ON public.customers;
DROP POLICY IF EXISTS "Users can manage their own jobs" ON public.jobs;
DROP POLICY IF EXISTS "Users can manage their own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can manage their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can manage their own invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users can manage their own calendar events" ON public.calendar_events;
DROP POLICY IF EXISTS "Users can manage their own activity logs" ON public.activity_logs;

-- Drop any existing admin policies that use unsafe patterns
DROP POLICY IF EXISTS "Admins can view all customers" ON public.customers;
DROP POLICY IF EXISTS "Admins can view all jobs" ON public.jobs;
DROP POLICY IF EXISTS "Admins can view all leads" ON public.leads;
DROP POLICY IF EXISTS "Admins can view all tasks" ON public.tasks;
DROP POLICY IF EXISTS "Admins can view all invoices" ON public.invoices;
DROP POLICY IF EXISTS "Admins can view all calendar events" ON public.calendar_events;
DROP POLICY IF EXISTS "Admins can view all activity logs" ON public.activity_logs;

-- Phase 2: Create standardized safe policies for all tables

-- Customers table - standardized policies
CREATE POLICY "Users and admins can view customers" ON public.customers
  FOR SELECT USING (auth.uid() = user_id OR is_admin(auth.uid()));

CREATE POLICY "Users and admins can create customers" ON public.customers
  FOR INSERT WITH CHECK (auth.uid() = user_id OR is_admin(auth.uid()));

CREATE POLICY "Users and admins can update customers" ON public.customers
  FOR UPDATE USING (auth.uid() = user_id OR is_admin(auth.uid()));

CREATE POLICY "Users and admins can delete customers" ON public.customers
  FOR DELETE USING (auth.uid() = user_id OR is_admin(auth.uid()));

-- Jobs table - standardized policies
CREATE POLICY "Users and admins can view jobs" ON public.jobs
  FOR SELECT USING (auth.uid() = user_id OR is_admin(auth.uid()));

CREATE POLICY "Users and admins can create jobs" ON public.jobs
  FOR INSERT WITH CHECK (auth.uid() = user_id OR is_admin(auth.uid()));

CREATE POLICY "Users and admins can update jobs" ON public.jobs
  FOR UPDATE USING (auth.uid() = user_id OR is_admin(auth.uid()));

CREATE POLICY "Users and admins can delete jobs" ON public.jobs
  FOR DELETE USING (auth.uid() = user_id OR is_admin(auth.uid()));

-- Leads table - standardized policies
CREATE POLICY "Users and admins can view leads" ON public.leads
  FOR SELECT USING (auth.uid() = user_id OR is_admin(auth.uid()));

CREATE POLICY "Users and admins can create leads" ON public.leads
  FOR INSERT WITH CHECK (auth.uid() = user_id OR is_admin(auth.uid()));

CREATE POLICY "Users and admins can update leads" ON public.leads
  FOR UPDATE USING (auth.uid() = user_id OR is_admin(auth.uid()));

CREATE POLICY "Users and admins can delete leads" ON public.leads
  FOR DELETE USING (auth.uid() = user_id OR is_admin(auth.uid()));

-- Tasks table - standardized policies
CREATE POLICY "Users and admins can view tasks" ON public.tasks
  FOR SELECT USING (auth.uid() = user_id OR is_admin(auth.uid()));

CREATE POLICY "Users and admins can create tasks" ON public.tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id OR is_admin(auth.uid()));

CREATE POLICY "Users and admins can update tasks" ON public.tasks
  FOR UPDATE USING (auth.uid() = user_id OR is_admin(auth.uid()));

CREATE POLICY "Users and admins can delete tasks" ON public.tasks
  FOR DELETE USING (auth.uid() = user_id OR is_admin(auth.uid()));

-- Estimates table - safe replacement policy
CREATE POLICY "Users and admins can view estimates" ON public.estimates
  FOR SELECT USING (auth.uid() = user_id OR is_admin(auth.uid()));

CREATE POLICY "Users and admins can create estimates" ON public.estimates
  FOR INSERT WITH CHECK (auth.uid() = user_id OR is_admin(auth.uid()));

CREATE POLICY "Users and admins can update estimates" ON public.estimates
  FOR UPDATE USING (auth.uid() = user_id OR is_admin(auth.uid()));

CREATE POLICY "Users and admins can delete estimates" ON public.estimates
  FOR DELETE USING (auth.uid() = user_id OR is_admin(auth.uid()));

-- Invoices table - standardized policies
CREATE POLICY "Users and admins can view invoices" ON public.invoices
  FOR SELECT USING (auth.uid() = user_id OR is_admin(auth.uid()));

CREATE POLICY "Users and admins can create invoices" ON public.invoices
  FOR INSERT WITH CHECK (auth.uid() = user_id OR is_admin(auth.uid()));

CREATE POLICY "Users and admins can update invoices" ON public.invoices
  FOR UPDATE USING (auth.uid() = user_id OR is_admin(auth.uid()));

CREATE POLICY "Users and admins can delete invoices" ON public.invoices
  FOR DELETE USING (auth.uid() = user_id OR is_admin(auth.uid()));

-- Calendar events table - standardized policies
CREATE POLICY "Users and admins can view calendar events" ON public.calendar_events
  FOR SELECT USING (auth.uid() = user_id OR is_admin(auth.uid()));

CREATE POLICY "Users and admins can create calendar events" ON public.calendar_events
  FOR INSERT WITH CHECK (auth.uid() = user_id OR is_admin(auth.uid()));

CREATE POLICY "Users and admins can update calendar events" ON public.calendar_events
  FOR UPDATE USING (auth.uid() = user_id OR is_admin(auth.uid()));

CREATE POLICY "Users and admins can delete calendar events" ON public.calendar_events
  FOR DELETE USING (auth.uid() = user_id OR is_admin(auth.uid()));

-- Activity logs table - standardized policies
CREATE POLICY "Users and admins can view activity logs" ON public.activity_logs
  FOR SELECT USING (auth.uid() = user_id OR is_admin(auth.uid()));

CREATE POLICY "Users and admins can create activity logs" ON public.activity_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id OR is_admin(auth.uid()));

CREATE POLICY "Users and admins can update activity logs" ON public.activity_logs
  FOR UPDATE USING (auth.uid() = user_id OR is_admin(auth.uid()));

CREATE POLICY "Users and admins can delete activity logs" ON public.activity_logs
  FOR DELETE USING (auth.uid() = user_id OR is_admin(auth.uid()));

-- Estimate line items - users can manage through estimates
CREATE POLICY "Users and admins can view estimate line items" ON public.estimate_line_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM estimates WHERE id = estimate_id AND (user_id = auth.uid() OR is_admin(auth.uid())))
  );

CREATE POLICY "Users and admins can create estimate line items" ON public.estimate_line_items
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM estimates WHERE id = estimate_id AND (user_id = auth.uid() OR is_admin(auth.uid())))
  );

CREATE POLICY "Users and admins can update estimate line items" ON public.estimate_line_items
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM estimates WHERE id = estimate_id AND (user_id = auth.uid() OR is_admin(auth.uid())))
  );

CREATE POLICY "Users and admins can delete estimate line items" ON public.estimate_line_items
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM estimates WHERE id = estimate_id AND (user_id = auth.uid() OR is_admin(auth.uid())))
  );

-- Invoice line items - users can manage through invoices
CREATE POLICY "Users and admins can view invoice line items" ON public.invoice_line_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM invoices WHERE id = invoice_id AND (user_id = auth.uid() OR is_admin(auth.uid())))
  );

CREATE POLICY "Users and admins can create invoice line items" ON public.invoice_line_items
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM invoices WHERE id = invoice_id AND (user_id = auth.uid() OR is_admin(auth.uid())))
  );

CREATE POLICY "Users and admins can update invoice line items" ON public.invoice_line_items
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM invoices WHERE id = invoice_id AND (user_id = auth.uid() OR is_admin(auth.uid())))
  );

CREATE POLICY "Users and admins can delete invoice line items" ON public.invoice_line_items
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM invoices WHERE id = invoice_id AND (user_id = auth.uid() OR is_admin(auth.uid())))
  );

-- Documents table - standardized policies
CREATE POLICY "Users and admins can view documents" ON public.documents
  FOR SELECT USING (auth.uid() = user_id OR is_admin(auth.uid()));

CREATE POLICY "Users and admins can create documents" ON public.documents
  FOR INSERT WITH CHECK (auth.uid() = user_id OR is_admin(auth.uid()));

CREATE POLICY "Users and admins can update documents" ON public.documents
  FOR UPDATE USING (auth.uid() = user_id OR is_admin(auth.uid()));

CREATE POLICY "Users and admins can delete documents" ON public.documents
  FOR DELETE USING (auth.uid() = user_id OR is_admin(auth.uid()));

-- Payments table - standardized policies
CREATE POLICY "Users and admins can view payments" ON public.payments
  FOR SELECT USING (auth.uid() = user_id OR is_admin(auth.uid()));

CREATE POLICY "Users and admins can create payments" ON public.payments
  FOR INSERT WITH CHECK (auth.uid() = user_id OR is_admin(auth.uid()));

CREATE POLICY "Users and admins can update payments" ON public.payments
  FOR UPDATE USING (auth.uid() = user_id OR is_admin(auth.uid()));

CREATE POLICY "Users and admins can delete payments" ON public.payments
  FOR DELETE USING (auth.uid() = user_id OR is_admin(auth.uid()));
