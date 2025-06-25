
-- Comprehensive RLS Policy Cleanup to Fix Infinite Recursion
-- This migration drops ALL existing policies and recreates them safely

-- Phase 1: Drop ALL existing RLS policies across all tables
-- Core CRM tables
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profiles" ON public.profiles;

DROP POLICY IF EXISTS "Users can view their own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can create their own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can create leads" ON public.leads;
DROP POLICY IF EXISTS "Users can update their own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can delete their own leads" ON public.leads;

DROP POLICY IF EXISTS "Users can view their own customers" ON public.customers;
DROP POLICY IF EXISTS "Users can create their own customers" ON public.customers;
DROP POLICY IF EXISTS "Users can create customers" ON public.customers;
DROP POLICY IF EXISTS "Users can update their own customers" ON public.customers;
DROP POLICY IF EXISTS "Users can delete their own customers" ON public.customers;

DROP POLICY IF EXISTS "Users can view their own jobs" ON public.jobs;
DROP POLICY IF EXISTS "Users can create their own jobs" ON public.jobs;
DROP POLICY IF EXISTS "Users can create jobs" ON public.jobs;
DROP POLICY IF EXISTS "Users can update their own jobs" ON public.jobs;
DROP POLICY IF EXISTS "Users can delete their own jobs" ON public.jobs;

DROP POLICY IF EXISTS "Users can view their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can create their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can create tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can update their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can delete their own tasks" ON public.tasks;

DROP POLICY IF EXISTS "Users can view their own estimates" ON public.estimates;
DROP POLICY IF EXISTS "Users can create their own estimates" ON public.estimates;
DROP POLICY IF EXISTS "Users can create estimates" ON public.estimates;
DROP POLICY IF EXISTS "Users can update their own estimates" ON public.estimates;
DROP POLICY IF EXISTS "Users can delete their own estimates" ON public.estimates;

DROP POLICY IF EXISTS "Users can view their own estimate line items" ON public.estimate_line_items;
DROP POLICY IF EXISTS "Users can view estimate line items through estimates" ON public.estimate_line_items;
DROP POLICY IF EXISTS "Users can create their own estimate line items" ON public.estimate_line_items;
DROP POLICY IF EXISTS "Users can create estimate line items through estimates" ON public.estimate_line_items;
DROP POLICY IF EXISTS "Users can create estimate line items" ON public.estimate_line_items;
DROP POLICY IF EXISTS "Users can update their own estimate line items" ON public.estimate_line_items;
DROP POLICY IF EXISTS "Users can update estimate line items through estimates" ON public.estimate_line_items;
DROP POLICY IF EXISTS "Users can delete their own estimate line items" ON public.estimate_line_items;
DROP POLICY IF EXISTS "Users can delete estimate line items through estimates" ON public.estimate_line_items;

DROP POLICY IF EXISTS "Users can view their own invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users can create their own invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users can create invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users can update their own invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users can delete their own invoices" ON public.invoices;

DROP POLICY IF EXISTS "Users can view their own invoice line items" ON public.invoice_line_items;
DROP POLICY IF EXISTS "Users can view invoice line items through invoices" ON public.invoice_line_items;
DROP POLICY IF EXISTS "Users can create their own invoice line items" ON public.invoice_line_items;
DROP POLICY IF EXISTS "Users can create invoice line items through invoices" ON public.invoice_line_items;
DROP POLICY IF EXISTS "Users can create invoice line items" ON public.invoice_line_items;
DROP POLICY IF EXISTS "Users can update their own invoice line items" ON public.invoice_line_items;
DROP POLICY IF EXISTS "Users can update invoice line items through invoices" ON public.invoice_line_items;
DROP POLICY IF EXISTS "Users can delete their own invoice line items" ON public.invoice_line_items;
DROP POLICY IF EXISTS "Users can delete invoice line items through invoices" ON public.invoice_line_items;

DROP POLICY IF EXISTS "Users can view their own payments" ON public.payments;
DROP POLICY IF EXISTS "Users can create their own payments" ON public.payments;
DROP POLICY IF EXISTS "Users can create payments" ON public.payments;
DROP POLICY IF EXISTS "Users can update their own payments" ON public.payments;
DROP POLICY IF EXISTS "Users can delete their own payments" ON public.payments;

DROP POLICY IF EXISTS "Users can view their own activity logs" ON public.activity_logs;
DROP POLICY IF EXISTS "Users can create their own activity logs" ON public.activity_logs;
DROP POLICY IF EXISTS "Users can create activity logs" ON public.activity_logs;

DROP POLICY IF EXISTS "Users can view their own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can create their own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can create documents" ON public.documents;
DROP POLICY IF EXISTS "Users can update their own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can delete their own documents" ON public.documents;

DROP POLICY IF EXISTS "Users can view their own calendar events" ON public.calendar_events;
DROP POLICY IF EXISTS "Users can create their own calendar events" ON public.calendar_events;
DROP POLICY IF EXISTS "Users can create calendar events" ON public.calendar_events;
DROP POLICY IF EXISTS "Users can update their own calendar events" ON public.calendar_events;
DROP POLICY IF EXISTS "Users can delete their own calendar events" ON public.calendar_events;

-- Advanced feature tables
DROP POLICY IF EXISTS "Users can view their own estimate templates" ON public.estimate_templates;
DROP POLICY IF EXISTS "Users can create their own estimate templates" ON public.estimate_templates;
DROP POLICY IF EXISTS "Users can update their own estimate templates" ON public.estimate_templates;
DROP POLICY IF EXISTS "Users can delete their own estimate templates" ON public.estimate_templates;
DROP POLICY IF EXISTS "Users can manage their own estimate templates" ON public.estimate_templates;

DROP POLICY IF EXISTS "Users can view their own follow-up reminders" ON public.follow_up_reminders;
DROP POLICY IF EXISTS "Users can create their own follow-up reminders" ON public.follow_up_reminders;
DROP POLICY IF EXISTS "Users can update their own follow-up reminders" ON public.follow_up_reminders;
DROP POLICY IF EXISTS "Users can delete their own follow-up reminders" ON public.follow_up_reminders;
DROP POLICY IF EXISTS "Users can manage their own follow-up reminders" ON public.follow_up_reminders;

DROP POLICY IF EXISTS "Users can view their own file policies" ON public.file_policies;
DROP POLICY IF EXISTS "Users can create their own file policies" ON public.file_policies;
DROP POLICY IF EXISTS "Users can update their own file policies" ON public.file_policies;
DROP POLICY IF EXISTS "Users can delete their own file policies" ON public.file_policies;
DROP POLICY IF EXISTS "Users can manage their own file policies" ON public.file_policies;

DROP POLICY IF EXISTS "Users can view their own file workflows" ON public.file_workflows;
DROP POLICY IF EXISTS "Users can create their own file workflows" ON public.file_workflows;
DROP POLICY IF EXISTS "Users can update their own file workflows" ON public.file_workflows;
DROP POLICY IF EXISTS "Users can delete their own file workflows" ON public.file_workflows;
DROP POLICY IF EXISTS "Users can manage their own file workflows" ON public.file_workflows;

DROP POLICY IF EXISTS "Users can view workflow steps for their workflows" ON public.workflow_steps;
DROP POLICY IF EXISTS "Users can create workflow steps for their workflows" ON public.workflow_steps;
DROP POLICY IF EXISTS "Users can update workflow steps for their workflows" ON public.workflow_steps;
DROP POLICY IF EXISTS "Users can delete workflow steps for their workflows" ON public.workflow_steps;

-- Business feature tables
DROP POLICY IF EXISTS "Users can manage their own accounting settings" ON public.accounting_settings;
DROP POLICY IF EXISTS "Users can manage their own payment methods" ON public.payment_methods;
DROP POLICY IF EXISTS "Users can manage their own campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Users can manage their own subscribers" ON public.subscribers;
DROP POLICY IF EXISTS "Users can manage their own social leads" ON public.social_leads;
DROP POLICY IF EXISTS "Users can manage their own workflows" ON public.workflows;
DROP POLICY IF EXISTS "Users can view their workflow logs" ON public.workflow_logs;
DROP POLICY IF EXISTS "Users can manage their own calendar integrations" ON public.calendar_integrations;
DROP POLICY IF EXISTS "Users can manage their own API keys" ON public.api_keys;
DROP POLICY IF EXISTS "Users can manage their own webhooks" ON public.webhooks;
DROP POLICY IF EXISTS "Users can manage their own signed documents" ON public.signed_documents;
DROP POLICY IF EXISTS "Users can manage their own companies" ON public.companies;
DROP POLICY IF EXISTS "Users can manage company themes" ON public.themes;
DROP POLICY IF EXISTS "Users can manage their own reports" ON public.reports;
DROP POLICY IF EXISTS "Users can manage their own KPIs" ON public.kpis;
DROP POLICY IF EXISTS "Users can manage their own dashboard widgets" ON public.dashboard_widgets;
DROP POLICY IF EXISTS "Users can manage their own backups" ON public.backups;
DROP POLICY IF EXISTS "Users can manage their own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users can manage their own offline tasks" ON public.offline_tasks;
DROP POLICY IF EXISTS "Users can manage their own uploads" ON public.uploads;
DROP POLICY IF EXISTS "Users can manage their own media files" ON public.media_files;
DROP POLICY IF EXISTS "Users can manage their own barcode logs" ON public.barcode_logs;
DROP POLICY IF EXISTS "Users can manage their own OCR docs" ON public.ocr_docs;
DROP POLICY IF EXISTS "Users can manage their own sentiment logs" ON public.sentiment_logs;
DROP POLICY IF EXISTS "Users can manage their own dashboard layouts" ON public.dashboard_layouts;

-- Phase 2: Create safe admin function to prevent recursion
DROP FUNCTION IF EXISTS public.get_user_role(uuid);
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid DEFAULT auth.uid())
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_role text;
BEGIN
    IF user_id IS NULL THEN
        RETURN 'anonymous';
    END IF;
    
    SELECT role INTO user_role 
    FROM public.profiles 
    WHERE id = user_id;
    
    RETURN COALESCE(user_role, 'client');
END;
$$;

-- Phase 3: Create standardized, safe RLS policies for all tables

-- Profiles table (special case - uses auth.uid() = id)
CREATE POLICY "profiles_select_policy" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_update_policy" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Leads table
CREATE POLICY "leads_select_policy" ON public.leads
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "leads_insert_policy" ON public.leads
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "leads_update_policy" ON public.leads
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "leads_delete_policy" ON public.leads
  FOR DELETE USING (auth.uid() = user_id);

-- Customers table
CREATE POLICY "customers_select_policy" ON public.customers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "customers_insert_policy" ON public.customers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "customers_update_policy" ON public.customers
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "customers_delete_policy" ON public.customers
  FOR DELETE USING (auth.uid() = user_id);

-- Jobs table
CREATE POLICY "jobs_select_policy" ON public.jobs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "jobs_insert_policy" ON public.jobs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "jobs_update_policy" ON public.jobs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "jobs_delete_policy" ON public.jobs
  FOR DELETE USING (auth.uid() = user_id);

-- Tasks table
CREATE POLICY "tasks_select_policy" ON public.tasks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "tasks_insert_policy" ON public.tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "tasks_update_policy" ON public.tasks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "tasks_delete_policy" ON public.tasks
  FOR DELETE USING (auth.uid() = user_id);

-- Estimates table
CREATE POLICY "estimates_select_policy" ON public.estimates
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "estimates_insert_policy" ON public.estimates
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "estimates_update_policy" ON public.estimates
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "estimates_delete_policy" ON public.estimates
  FOR DELETE USING (auth.uid() = user_id);

-- Estimate line items (nested through estimates)
CREATE POLICY "estimate_line_items_select_policy" ON public.estimate_line_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.estimates 
      WHERE id = estimate_line_items.estimate_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "estimate_line_items_insert_policy" ON public.estimate_line_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.estimates 
      WHERE id = estimate_line_items.estimate_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "estimate_line_items_update_policy" ON public.estimate_line_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.estimates 
      WHERE id = estimate_line_items.estimate_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "estimate_line_items_delete_policy" ON public.estimate_line_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.estimates 
      WHERE id = estimate_line_items.estimate_id 
      AND user_id = auth.uid()
    )
  );

-- Invoices table
CREATE POLICY "invoices_select_policy" ON public.invoices
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "invoices_insert_policy" ON public.invoices
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "invoices_update_policy" ON public.invoices
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "invoices_delete_policy" ON public.invoices
  FOR DELETE USING (auth.uid() = user_id);

-- Invoice line items (nested through invoices)
CREATE POLICY "invoice_line_items_select_policy" ON public.invoice_line_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.invoices 
      WHERE id = invoice_line_items.invoice_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "invoice_line_items_insert_policy" ON public.invoice_line_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.invoices 
      WHERE id = invoice_line_items.invoice_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "invoice_line_items_update_policy" ON public.invoice_line_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.invoices 
      WHERE id = invoice_line_items.invoice_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "invoice_line_items_delete_policy" ON public.invoice_line_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.invoices 
      WHERE id = invoice_line_items.invoice_id 
      AND user_id = auth.uid()
    )
  );

-- Payments table
CREATE POLICY "payments_select_policy" ON public.payments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "payments_insert_policy" ON public.payments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "payments_update_policy" ON public.payments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "payments_delete_policy" ON public.payments
  FOR DELETE USING (auth.uid() = user_id);

-- Activity logs table
CREATE POLICY "activity_logs_select_policy" ON public.activity_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "activity_logs_insert_policy" ON public.activity_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Documents table
CREATE POLICY "documents_select_policy" ON public.documents
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "documents_insert_policy" ON public.documents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "documents_update_policy" ON public.documents
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "documents_delete_policy" ON public.documents
  FOR DELETE USING (auth.uid() = user_id);

-- Calendar events table
CREATE POLICY "calendar_events_select_policy" ON public.calendar_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "calendar_events_insert_policy" ON public.calendar_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "calendar_events_update_policy" ON public.calendar_events
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "calendar_events_delete_policy" ON public.calendar_events
  FOR DELETE USING (auth.uid() = user_id);

-- Advanced feature tables - Estimate templates
CREATE POLICY "estimate_templates_select_policy" ON public.estimate_templates
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "estimate_templates_insert_policy" ON public.estimate_templates
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "estimate_templates_update_policy" ON public.estimate_templates
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "estimate_templates_delete_policy" ON public.estimate_templates
  FOR DELETE USING (auth.uid() = user_id);

-- Follow-up reminders
CREATE POLICY "follow_up_reminders_select_policy" ON public.follow_up_reminders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "follow_up_reminders_insert_policy" ON public.follow_up_reminders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "follow_up_reminders_update_policy" ON public.follow_up_reminders
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "follow_up_reminders_delete_policy" ON public.follow_up_reminders
  FOR DELETE USING (auth.uid() = user_id);

-- File policies
CREATE POLICY "file_policies_select_policy" ON public.file_policies
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "file_policies_insert_policy" ON public.file_policies
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "file_policies_update_policy" ON public.file_policies
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "file_policies_delete_policy" ON public.file_policies
  FOR DELETE USING (auth.uid() = user_id);

-- File workflows
CREATE POLICY "file_workflows_select_policy" ON public.file_workflows
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "file_workflows_insert_policy" ON public.file_workflows
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "file_workflows_update_policy" ON public.file_workflows
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "file_workflows_delete_policy" ON public.file_workflows
  FOR DELETE USING (auth.uid() = user_id);

-- Workflow steps (nested through file workflows)
CREATE POLICY "workflow_steps_select_policy" ON public.workflow_steps
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.file_workflows 
      WHERE id = workflow_steps.workflow_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "workflow_steps_insert_policy" ON public.workflow_steps
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.file_workflows 
      WHERE id = workflow_steps.workflow_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "workflow_steps_update_policy" ON public.workflow_steps
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.file_workflows 
      WHERE id = workflow_steps.workflow_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "workflow_steps_delete_policy" ON public.workflow_steps
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.file_workflows 
      WHERE id = workflow_steps.workflow_id 
      AND user_id = auth.uid()
    )
  );

-- Business features - all remaining tables with user_id
CREATE POLICY "accounting_settings_all_policy" ON public.accounting_settings
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "payment_methods_all_policy" ON public.payment_methods
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "campaigns_all_policy" ON public.campaigns
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "subscribers_all_policy" ON public.subscribers
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "social_leads_all_policy" ON public.social_leads
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "workflows_all_policy" ON public.workflows
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "workflow_logs_select_policy" ON public.workflow_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.workflows 
      WHERE id = workflow_logs.workflow_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "calendar_integrations_all_policy" ON public.calendar_integrations
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "api_keys_all_policy" ON public.api_keys
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "webhooks_all_policy" ON public.webhooks
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "signed_documents_all_policy" ON public.signed_documents
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "companies_all_policy" ON public.companies
  FOR ALL USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "themes_all_policy" ON public.themes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.companies 
      WHERE id = themes.company_id 
      AND owner_id = auth.uid()
    )
  );

CREATE POLICY "reports_all_policy" ON public.reports
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "kpis_all_policy" ON public.kpis
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "dashboard_widgets_all_policy" ON public.dashboard_widgets
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "backups_all_policy" ON public.backups
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_settings_all_policy" ON public.user_settings
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "offline_tasks_all_policy" ON public.offline_tasks
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "uploads_all_policy" ON public.uploads
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "media_files_all_policy" ON public.media_files
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "barcode_logs_all_policy" ON public.barcode_logs
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "ocr_docs_all_policy" ON public.ocr_docs
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "sentiment_logs_all_policy" ON public.sentiment_logs
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "dashboard_layouts_all_policy" ON public.dashboard_layouts
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Phase 4: Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.get_user_role(uuid) TO anon, authenticated;

-- Create comment to document this comprehensive cleanup
COMMENT ON SCHEMA public IS 'Comprehensive RLS policy cleanup completed - all policies recreated with safe, non-recursive patterns to eliminate infinite recursion issues';
