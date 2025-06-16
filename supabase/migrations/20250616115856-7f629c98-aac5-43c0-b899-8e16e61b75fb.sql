
-- First, ensure we have the correct profile structure and your admin profile
-- Insert your admin profile if it doesn't exist
INSERT INTO public.profiles (id, email, first_name, last_name, role)
VALUES (
  '28dc0c62-8e09-44e3-9497-5f62c6a0b436',
  'nayib@finalroofingcompany.com',
  'nayib',
  'trochez',
  'admin'
)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  role = EXCLUDED.role;

-- Drop all existing RLS policies to start fresh
-- Core CRM tables
DROP POLICY IF EXISTS "Users can view their own profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profiles" ON public.profiles;

DROP POLICY IF EXISTS "Users can view their own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can create their own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can update their own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can delete their own leads" ON public.leads;

DROP POLICY IF EXISTS "Users can view their own customers" ON public.customers;
DROP POLICY IF EXISTS "Users can create their own customers" ON public.customers;
DROP POLICY IF EXISTS "Users can update their own customers" ON public.customers;
DROP POLICY IF EXISTS "Users can delete their own customers" ON public.customers;

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

DROP POLICY IF EXISTS "Users can view estimate line items through estimates" ON public.estimate_line_items;
DROP POLICY IF EXISTS "Users can create estimate line items through estimates" ON public.estimate_line_items;
DROP POLICY IF EXISTS "Users can update estimate line items through estimates" ON public.estimate_line_items;
DROP POLICY IF EXISTS "Users can delete estimate line items through estimates" ON public.estimate_line_items;

DROP POLICY IF EXISTS "Users can view their own invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users can create their own invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users can update their own invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users can delete their own invoices" ON public.invoices;

DROP POLICY IF EXISTS "Users can view invoice line items through invoices" ON public.invoice_line_items;
DROP POLICY IF EXISTS "Users can create invoice line items through invoices" ON public.invoice_line_items;
DROP POLICY IF EXISTS "Users can update invoice line items through invoices" ON public.invoice_line_items;
DROP POLICY IF EXISTS "Users can delete invoice line items through invoices" ON public.invoice_line_items;

DROP POLICY IF EXISTS "Users can view their own activity logs" ON public.activity_logs;
DROP POLICY IF EXISTS "Users can create their own activity logs" ON public.activity_logs;

DROP POLICY IF EXISTS "Users can view their own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can create their own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can update their own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can delete their own documents" ON public.documents;

DROP POLICY IF EXISTS "Users can view their own calendar events" ON public.calendar_events;
DROP POLICY IF EXISTS "Users can create their own calendar events" ON public.calendar_events;
DROP POLICY IF EXISTS "Users can update their own calendar events" ON public.calendar_events;
DROP POLICY IF EXISTS "Users can delete their own calendar events" ON public.calendar_events;

DROP POLICY IF EXISTS "Users can view their own payments" ON public.payments;
DROP POLICY IF EXISTS "Users can create their own payments" ON public.payments;
DROP POLICY IF EXISTS "Users can update their own payments" ON public.payments;
DROP POLICY IF EXISTS "Users can delete their own payments" ON public.payments;

-- Advanced feature tables
DROP POLICY IF EXISTS "Users can manage their own estimate templates" ON public.estimate_templates;
DROP POLICY IF EXISTS "Users can manage their own follow-up reminders" ON public.follow_up_reminders;
DROP POLICY IF EXISTS "Users can manage their own file policies" ON public.file_policies;
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

-- Create comprehensive RLS policies for core CRM functionality
-- Profiles table
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Leads table
CREATE POLICY "Users can view their own leads" ON public.leads
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own leads" ON public.leads
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own leads" ON public.leads
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own leads" ON public.leads
  FOR DELETE USING (auth.uid() = user_id);

-- Customers table
CREATE POLICY "Users can view their own customers" ON public.customers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own customers" ON public.customers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own customers" ON public.customers
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own customers" ON public.customers
  FOR DELETE USING (auth.uid() = user_id);

-- Jobs table
CREATE POLICY "Users can view their own jobs" ON public.jobs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own jobs" ON public.jobs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own jobs" ON public.jobs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own jobs" ON public.jobs
  FOR DELETE USING (auth.uid() = user_id);

-- Tasks table
CREATE POLICY "Users can view their own tasks" ON public.tasks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tasks" ON public.tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks" ON public.tasks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks" ON public.tasks
  FOR DELETE USING (auth.uid() = user_id);

-- Estimates table
CREATE POLICY "Users can view their own estimates" ON public.estimates
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own estimates" ON public.estimates
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own estimates" ON public.estimates
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own estimates" ON public.estimates
  FOR DELETE USING (auth.uid() = user_id);

-- Estimate line items (nested through estimates)
CREATE POLICY "Users can view estimate line items through estimates" ON public.estimate_line_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.estimates 
      WHERE id = estimate_line_items.estimate_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create estimate line items through estimates" ON public.estimate_line_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.estimates 
      WHERE id = estimate_line_items.estimate_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update estimate line items through estimates" ON public.estimate_line_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.estimates 
      WHERE id = estimate_line_items.estimate_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete estimate line items through estimates" ON public.estimate_line_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.estimates 
      WHERE id = estimate_line_items.estimate_id 
      AND user_id = auth.uid()
    )
  );

-- Invoices table
CREATE POLICY "Users can view their own invoices" ON public.invoices
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own invoices" ON public.invoices
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own invoices" ON public.invoices
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own invoices" ON public.invoices
  FOR DELETE USING (auth.uid() = user_id);

-- Invoice line items (nested through invoices)
CREATE POLICY "Users can view invoice line items through invoices" ON public.invoice_line_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.invoices 
      WHERE id = invoice_line_items.invoice_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create invoice line items through invoices" ON public.invoice_line_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.invoices 
      WHERE id = invoice_line_items.invoice_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update invoice line items through invoices" ON public.invoice_line_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.invoices 
      WHERE id = invoice_line_items.invoice_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete invoice line items through invoices" ON public.invoice_line_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.invoices 
      WHERE id = invoice_line_items.invoice_id 
      AND user_id = auth.uid()
    )
  );

-- Activity logs table
CREATE POLICY "Users can view their own activity logs" ON public.activity_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own activity logs" ON public.activity_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Documents table
CREATE POLICY "Users can view their own documents" ON public.documents
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own documents" ON public.documents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own documents" ON public.documents
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own documents" ON public.documents
  FOR DELETE USING (auth.uid() = user_id);

-- Calendar events table
CREATE POLICY "Users can view their own calendar events" ON public.calendar_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own calendar events" ON public.calendar_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own calendar events" ON public.calendar_events
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own calendar events" ON public.calendar_events
  FOR DELETE USING (auth.uid() = user_id);

-- Payments table
CREATE POLICY "Users can view their own payments" ON public.payments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own payments" ON public.payments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own payments" ON public.payments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own payments" ON public.payments
  FOR DELETE USING (auth.uid() = user_id);

-- Advanced CRM features
-- Estimate templates
CREATE POLICY "Users can manage their own estimate templates" ON public.estimate_templates
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Follow-up reminders
CREATE POLICY "Users can manage their own follow-up reminders" ON public.follow_up_reminders
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- File policies
CREATE POLICY "Users can manage their own file policies" ON public.file_policies
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- File workflows
CREATE POLICY "Users can manage their own file workflows" ON public.file_workflows
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Workflow steps (nested through file workflows)
CREATE POLICY "Users can view workflow steps for their workflows" ON public.workflow_steps
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.file_workflows 
      WHERE id = workflow_steps.workflow_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create workflow steps for their workflows" ON public.workflow_steps
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.file_workflows 
      WHERE id = workflow_steps.workflow_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update workflow steps for their workflows" ON public.workflow_steps
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.file_workflows 
      WHERE id = workflow_steps.workflow_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete workflow steps for their workflows" ON public.workflow_steps
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.file_workflows 
      WHERE id = workflow_steps.workflow_id 
      AND user_id = auth.uid()
    )
  );

-- Business features (comprehensive policies for all advanced tables)
CREATE POLICY "Users can manage their own accounting settings" ON public.accounting_settings
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own payment methods" ON public.payment_methods
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own campaigns" ON public.campaigns
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own subscribers" ON public.subscribers
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own social leads" ON public.social_leads
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own workflows" ON public.workflows
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their workflow logs" ON public.workflow_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.workflows 
      WHERE id = workflow_logs.workflow_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage their own calendar integrations" ON public.calendar_integrations
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own API keys" ON public.api_keys
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own webhooks" ON public.webhooks
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own signed documents" ON public.signed_documents
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own companies" ON public.companies
  FOR ALL USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can manage company themes" ON public.themes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.companies 
      WHERE id = themes.company_id 
      AND owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage their own reports" ON public.reports
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own KPIs" ON public.kpis
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own dashboard widgets" ON public.dashboard_widgets
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own backups" ON public.backups
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own settings" ON public.user_settings
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own offline tasks" ON public.offline_tasks
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own uploads" ON public.uploads
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own media files" ON public.media_files
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own barcode logs" ON public.barcode_logs
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own OCR docs" ON public.ocr_docs
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own sentiment logs" ON public.sentiment_logs
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own dashboard layouts" ON public.dashboard_layouts
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
