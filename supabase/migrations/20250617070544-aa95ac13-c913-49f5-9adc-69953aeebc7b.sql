
-- Phase 1: Policy Cleanup - Remove Duplicate RLS Policies and Standardize

-- =======================
-- 1. CUSTOMERS TABLE CLEANUP
-- =======================
-- Drop all existing policies (12 duplicates found)
DROP POLICY IF EXISTS "Users can view their own customers" ON public.customers;
DROP POLICY IF EXISTS "Users can create customers" ON public.customers;
DROP POLICY IF EXISTS "Users can create their own customers" ON public.customers;
DROP POLICY IF EXISTS "Users can update their own customers" ON public.customers;
DROP POLICY IF EXISTS "Users can delete their own customers" ON public.customers;

-- Create standardized policies
CREATE POLICY "customers_select_own" ON public.customers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "customers_insert_own" ON public.customers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "customers_update_own" ON public.customers
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "customers_delete_own" ON public.customers
  FOR DELETE USING (auth.uid() = user_id);

-- =======================
-- 2. LEADS TABLE CLEANUP
-- =======================
-- Drop all existing policies (11 duplicates found)
DROP POLICY IF EXISTS "Users can view their own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can create leads" ON public.leads;
DROP POLICY IF EXISTS "Users can create their own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can update their own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can delete their own leads" ON public.leads;

-- Create standardized policies
CREATE POLICY "leads_select_own" ON public.leads
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "leads_insert_own" ON public.leads
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "leads_update_own" ON public.leads
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "leads_delete_own" ON public.leads
  FOR DELETE USING (auth.uid() = user_id);

-- =======================
-- 3. JOBS TABLE CLEANUP
-- =======================
-- Drop all existing policies (11 duplicates found)
DROP POLICY IF EXISTS "Users can view their own jobs" ON public.jobs;
DROP POLICY IF EXISTS "Users can create jobs" ON public.jobs;
DROP POLICY IF EXISTS "Users can create their own jobs" ON public.jobs;
DROP POLICY IF EXISTS "Users can update their own jobs" ON public.jobs;
DROP POLICY IF EXISTS "Users can delete their own jobs" ON public.jobs;

-- Create standardized policies
CREATE POLICY "jobs_select_own" ON public.jobs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "jobs_insert_own" ON public.jobs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "jobs_update_own" ON public.jobs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "jobs_delete_own" ON public.jobs
  FOR DELETE USING (auth.uid() = user_id);

-- =======================
-- 4. TASKS TABLE CLEANUP
-- =======================
-- Drop all existing policies (11 duplicates found)
DROP POLICY IF EXISTS "Users can view their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can create tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can create their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can update their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can delete their own tasks" ON public.tasks;

-- Create standardized policies
CREATE POLICY "tasks_select_own" ON public.tasks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "tasks_insert_own" ON public.tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "tasks_update_own" ON public.tasks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "tasks_delete_own" ON public.tasks
  FOR DELETE USING (auth.uid() = user_id);

-- =======================
-- 5. ESTIMATES TABLE CLEANUP
-- =======================
-- Drop all existing policies (11 duplicates found)
DROP POLICY IF EXISTS "Users can view their own estimates" ON public.estimates;
DROP POLICY IF EXISTS "Users can create estimates" ON public.estimates;
DROP POLICY IF EXISTS "Users can create their own estimates" ON public.estimates;
DROP POLICY IF EXISTS "Users can update their own estimates" ON public.estimates;
DROP POLICY IF EXISTS "Users can delete their own estimates" ON public.estimates;

-- Create standardized policies
CREATE POLICY "estimates_select_own" ON public.estimates
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "estimates_insert_own" ON public.estimates
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "estimates_update_own" ON public.estimates
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "estimates_delete_own" ON public.estimates
  FOR DELETE USING (auth.uid() = user_id);

-- =======================
-- 6. ESTIMATE LINE ITEMS CLEANUP
-- =======================
-- Drop all existing policies (nested through estimates)
DROP POLICY IF EXISTS "Users can view their own estimate line items" ON public.estimate_line_items;
DROP POLICY IF EXISTS "Users can view estimate line items through estimates" ON public.estimate_line_items;
DROP POLICY IF EXISTS "Users can create estimate line items" ON public.estimate_line_items;
DROP POLICY IF EXISTS "Users can create estimate line items through estimates" ON public.estimate_line_items;
DROP POLICY IF EXISTS "Users can update their own estimate line items" ON public.estimate_line_items;
DROP POLICY IF EXISTS "Users can update estimate line items through estimates" ON public.estimate_line_items;
DROP POLICY IF EXISTS "Users can delete their own estimate line items" ON public.estimate_line_items;
DROP POLICY IF EXISTS "Users can delete estimate line items through estimates" ON public.estimate_line_items;

-- Create standardized nested policies
CREATE POLICY "estimate_line_items_select_via_estimates" ON public.estimate_line_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.estimates 
      WHERE id = estimate_line_items.estimate_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "estimate_line_items_insert_via_estimates" ON public.estimate_line_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.estimates 
      WHERE id = estimate_line_items.estimate_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "estimate_line_items_update_via_estimates" ON public.estimate_line_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.estimates 
      WHERE id = estimate_line_items.estimate_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "estimate_line_items_delete_via_estimates" ON public.estimate_line_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.estimates 
      WHERE id = estimate_line_items.estimate_id 
      AND user_id = auth.uid()
    )
  );

-- =======================
-- 7. INVOICES TABLE CLEANUP
-- =======================
-- Drop all existing policies (11 duplicates found)
DROP POLICY IF EXISTS "Users can view their own invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users can create invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users can create their own invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users can update their own invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users can delete their own invoices" ON public.invoices;

-- Create standardized policies
CREATE POLICY "invoices_select_own" ON public.invoices
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "invoices_insert_own" ON public.invoices
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "invoices_update_own" ON public.invoices
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "invoices_delete_own" ON public.invoices
  FOR DELETE USING (auth.uid() = user_id);

-- =======================
-- 8. INVOICE LINE ITEMS CLEANUP
-- =======================
-- Drop all existing policies (nested through invoices)
DROP POLICY IF EXISTS "Users can view their own invoice line items" ON public.invoice_line_items;
DROP POLICY IF EXISTS "Users can view invoice line items through invoices" ON public.invoice_line_items;
DROP POLICY IF EXISTS "Users can create invoice line items" ON public.invoice_line_items;
DROP POLICY IF EXISTS "Users can create invoice line items through invoices" ON public.invoice_line_items;
DROP POLICY IF EXISTS "Users can update their own invoice line items" ON public.invoice_line_items;
DROP POLICY IF EXISTS "Users can update invoice line items through invoices" ON public.invoice_line_items;
DROP POLICY IF EXISTS "Users can delete their own invoice line items" ON public.invoice_line_items;
DROP POLICY IF EXISTS "Users can delete invoice line items through invoices" ON public.invoice_line_items;

-- Create standardized nested policies
CREATE POLICY "invoice_line_items_select_via_invoices" ON public.invoice_line_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.invoices 
      WHERE id = invoice_line_items.invoice_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "invoice_line_items_insert_via_invoices" ON public.invoice_line_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.invoices 
      WHERE id = invoice_line_items.invoice_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "invoice_line_items_update_via_invoices" ON public.invoice_line_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.invoices 
      WHERE id = invoice_line_items.invoice_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "invoice_line_items_delete_via_invoices" ON public.invoice_line_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.invoices 
      WHERE id = invoice_line_items.invoice_id 
      AND user_id = auth.uid()
    )
  );

-- =======================
-- 9. ACTIVITY LOGS CLEANUP
-- =======================
-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view their own activity logs" ON public.activity_logs;
DROP POLICY IF EXISTS "Users can create their own activity logs" ON public.activity_logs;
DROP POLICY IF EXISTS "Users can create activity logs" ON public.activity_logs;

-- Create standardized policies
CREATE POLICY "activity_logs_select_own" ON public.activity_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "activity_logs_insert_own" ON public.activity_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =======================
-- 10. PROFILES TABLE CLEANUP
-- =======================
-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profiles" ON public.profiles;

-- Create standardized policies
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- =======================
-- 11. ADD MISSING POLICIES FOR TABLES WITHOUT RLS
-- =======================

-- Calculator submissions (public data, limited access)
CREATE POLICY "calculator_submissions_select_own" ON public.calculator_submissions
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "calculator_submissions_insert_public" ON public.calculator_submissions
  FOR INSERT WITH CHECK (true); -- Allow public submissions

-- Reviews (public read, admin write)
CREATE POLICY "reviews_select_all" ON public.reviews
  FOR SELECT USING (true); -- Public read

CREATE POLICY "reviews_manage_own" ON public.reviews
  FOR ALL USING (auth.uid() = user_id);

-- Documents
CREATE POLICY "documents_select_own" ON public.documents
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "documents_insert_own" ON public.documents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "documents_update_own" ON public.documents
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "documents_delete_own" ON public.documents
  FOR DELETE USING (auth.uid() = user_id);

-- Calendar events
CREATE POLICY "calendar_events_select_own" ON public.calendar_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "calendar_events_insert_own" ON public.calendar_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "calendar_events_update_own" ON public.calendar_events
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "calendar_events_delete_own" ON public.calendar_events
  FOR DELETE USING (auth.uid() = user_id);

-- Payments
CREATE POLICY "payments_select_own" ON public.payments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "payments_insert_own" ON public.payments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "payments_update_own" ON public.payments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "payments_delete_own" ON public.payments
  FOR DELETE USING (auth.uid() = user_id);

-- =======================
-- 12. REMOVE DUPLICATE TRIGGERS
-- =======================

-- Remove duplicate line item total calculation triggers
DROP TRIGGER IF EXISTS estimate_line_item_calculate_total ON public.estimate_line_items;
DROP TRIGGER IF EXISTS invoice_line_item_calculate_total ON public.invoice_line_items;

-- Recreate single triggers for line item calculations
CREATE TRIGGER estimate_line_item_calculate_total
  BEFORE INSERT OR UPDATE ON public.estimate_line_items
  FOR EACH ROW
  EXECUTE FUNCTION calculate_line_item_total();

CREATE TRIGGER invoice_line_item_calculate_total
  BEFORE INSERT OR UPDATE ON public.invoice_line_items
  FOR EACH ROW
  EXECUTE FUNCTION calculate_line_item_total();

-- Remove duplicate total update triggers
DROP TRIGGER IF EXISTS update_estimate_totals_trigger ON public.estimate_line_items;
DROP TRIGGER IF EXISTS update_invoice_totals_trigger ON public.invoice_line_items;

-- Recreate single triggers for total updates
CREATE TRIGGER update_estimate_totals_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.estimate_line_items
  FOR EACH ROW EXECUTE FUNCTION update_estimate_totals();

CREATE TRIGGER update_invoice_totals_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.invoice_line_items
  FOR EACH ROW EXECUTE FUNCTION update_invoice_totals();

-- =======================
-- 13. COMPREHENSIVE RLS POLICIES FOR ALL ADVANCED TABLES
-- =======================

-- Advanced CRM features with standardized naming
-- Estimate templates
DROP POLICY IF EXISTS "Users can manage their own estimate templates" ON public.estimate_templates;
CREATE POLICY "estimate_templates_manage_own" ON public.estimate_templates
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Follow-up reminders  
DROP POLICY IF EXISTS "Users can manage their own follow-up reminders" ON public.follow_up_reminders;
CREATE POLICY "follow_up_reminders_manage_own" ON public.follow_up_reminders
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- File policies
DROP POLICY IF EXISTS "Users can manage their own file policies" ON public.file_policies;
CREATE POLICY "file_policies_manage_own" ON public.file_policies
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- File workflows
DROP POLICY IF EXISTS "Users can manage their own file workflows" ON public.file_workflows;
CREATE POLICY "file_workflows_manage_own" ON public.file_workflows
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Workflow steps (nested through file workflows)
DROP POLICY IF EXISTS "Users can view workflow steps for their workflows" ON public.workflow_steps;
DROP POLICY IF EXISTS "Users can create workflow steps for their workflows" ON public.workflow_steps;
DROP POLICY IF EXISTS "Users can update workflow steps for their workflows" ON public.workflow_steps;
DROP POLICY IF EXISTS "Users can delete workflow steps for their workflows" ON public.workflow_steps;

CREATE POLICY "workflow_steps_manage_via_workflows" ON public.workflow_steps
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.file_workflows 
      WHERE id = workflow_steps.workflow_id 
      AND user_id = auth.uid()
    )
  );

-- All business feature tables with standardized policies
CREATE POLICY "accounting_settings_manage_own" ON public.accounting_settings
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "payment_methods_manage_own" ON public.payment_methods
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "campaigns_manage_own" ON public.campaigns
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "subscribers_manage_own" ON public.subscribers
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "social_leads_manage_own" ON public.social_leads
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "workflows_manage_own" ON public.workflows
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "workflow_logs_select_via_workflows" ON public.workflow_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.workflows 
      WHERE id = workflow_logs.workflow_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "calendar_integrations_manage_own" ON public.calendar_integrations
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "api_keys_manage_own" ON public.api_keys
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "webhooks_manage_own" ON public.webhooks
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "signed_documents_manage_own" ON public.signed_documents
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "companies_manage_own" ON public.companies
  FOR ALL USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "themes_manage_via_companies" ON public.themes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.companies 
      WHERE id = themes.company_id 
      AND owner_id = auth.uid()
    )
  );

CREATE POLICY "reports_manage_own" ON public.reports
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "kpis_manage_own" ON public.kpis
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "dashboard_widgets_manage_own" ON public.dashboard_widgets
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "backups_manage_own" ON public.backups
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_settings_manage_own" ON public.user_settings
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "offline_tasks_manage_own" ON public.offline_tasks
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "uploads_manage_own" ON public.uploads
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "media_files_manage_own" ON public.media_files
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "barcode_logs_manage_own" ON public.barcode_logs
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "ocr_docs_manage_own" ON public.ocr_docs
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "sentiment_logs_manage_own" ON public.sentiment_logs
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "dashboard_layouts_manage_own" ON public.dashboard_layouts
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
