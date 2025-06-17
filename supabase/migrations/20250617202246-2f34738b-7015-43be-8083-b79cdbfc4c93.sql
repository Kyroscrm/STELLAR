
-- =============================================================================
-- PHASE 5: COMPREHENSIVE RLS CLEANUP & SECURITY STANDARDIZATION
-- =============================================================================
-- This migration eliminates duplicate policies and standardizes security patterns

-- =============================================================================
-- STEP 1: DROP ALL EXISTING DUPLICATE POLICIES
-- =============================================================================

-- Core CRM tables - drop all existing policies
DROP POLICY IF EXISTS "Users and admins can view customers" ON public.customers;
DROP POLICY IF EXISTS "Users and admins can create customers" ON public.customers;
DROP POLICY IF EXISTS "Users and admins can update customers" ON public.customers;
DROP POLICY IF EXISTS "Users and admins can delete customers" ON public.customers;
DROP POLICY IF EXISTS "customers_select_policy" ON public.customers;
DROP POLICY IF EXISTS "customers_insert_policy" ON public.customers;
DROP POLICY IF EXISTS "customers_update_policy" ON public.customers;
DROP POLICY IF EXISTS "customers_delete_policy" ON public.customers;

DROP POLICY IF EXISTS "Users and admins can view leads" ON public.leads;
DROP POLICY IF EXISTS "Users and admins can create leads" ON public.leads;
DROP POLICY IF EXISTS "Users and admins can update leads" ON public.leads;
DROP POLICY IF EXISTS "Users and admins can delete leads" ON public.leads;
DROP POLICY IF EXISTS "leads_select_policy" ON public.leads;
DROP POLICY IF EXISTS "leads_insert_policy" ON public.leads;
DROP POLICY IF EXISTS "leads_update_policy" ON public.leads;
DROP POLICY IF EXISTS "leads_delete_policy" ON public.leads;

DROP POLICY IF EXISTS "Users and admins can view jobs" ON public.jobs;
DROP POLICY IF EXISTS "Users and admins can create jobs" ON public.jobs;
DROP POLICY IF EXISTS "Users and admins can update jobs" ON public.jobs;
DROP POLICY IF EXISTS "Users and admins can delete jobs" ON public.jobs;
DROP POLICY IF EXISTS "jobs_select_policy" ON public.jobs;
DROP POLICY IF EXISTS "jobs_insert_policy" ON public.jobs;
DROP POLICY IF EXISTS "jobs_update_policy" ON public.jobs;
DROP POLICY IF EXISTS "jobs_delete_policy" ON public.jobs;

DROP POLICY IF EXISTS "Users and admins can view tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users and admins can create tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users and admins can update tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users and admins can delete tasks" ON public.tasks;
DROP POLICY IF EXISTS "tasks_select_policy" ON public.tasks;
DROP POLICY IF EXISTS "tasks_insert_policy" ON public.tasks;
DROP POLICY IF EXISTS "tasks_update_policy" ON public.tasks;
DROP POLICY IF EXISTS "tasks_delete_policy" ON public.tasks;

DROP POLICY IF EXISTS "Users and admins can view estimates" ON public.estimates;
DROP POLICY IF EXISTS "Users and admins can create estimates" ON public.estimates;
DROP POLICY IF EXISTS "Users and admins can update estimates" ON public.estimates;
DROP POLICY IF EXISTS "Users and admins can delete estimates" ON public.estimates;
DROP POLICY IF EXISTS "estimates_select_policy" ON public.estimates;
DROP POLICY IF EXISTS "estimates_insert_policy" ON public.estimates;
DROP POLICY IF EXISTS "estimates_update_policy" ON public.estimates;
DROP POLICY IF EXISTS "estimates_delete_policy" ON public.estimates;

DROP POLICY IF EXISTS "Users and admins can view invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users and admins can create invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users and admins can update invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users and admins can delete invoices" ON public.invoices;
DROP POLICY IF EXISTS "invoices_select_policy" ON public.invoices;
DROP POLICY IF EXISTS "invoices_insert_policy" ON public.invoices;
DROP POLICY IF EXISTS "invoices_update_policy" ON public.invoices;
DROP POLICY IF EXISTS "invoices_delete_policy" ON public.invoices;

-- Line items tables
DROP POLICY IF EXISTS "Users and admins can view estimate line items" ON public.estimate_line_items;
DROP POLICY IF EXISTS "Users and admins can create estimate line items" ON public.estimate_line_items;
DROP POLICY IF EXISTS "Users and admins can update estimate line items" ON public.estimate_line_items;
DROP POLICY IF EXISTS "Users and admins can delete estimate line items" ON public.estimate_line_items;
DROP POLICY IF EXISTS "Users can view estimate line items through estimates" ON public.estimate_line_items;
DROP POLICY IF EXISTS "Users can create estimate line items through estimates" ON public.estimate_line_items;
DROP POLICY IF EXISTS "Users can update estimate line items through estimates" ON public.estimate_line_items;
DROP POLICY IF EXISTS "Users can delete estimate line items through estimates" ON public.estimate_line_items;

DROP POLICY IF EXISTS "Users and admins can view invoice line items" ON public.invoice_line_items;
DROP POLICY IF EXISTS "Users and admins can create invoice line items" ON public.invoice_line_items;
DROP POLICY IF EXISTS "Users and admins can update invoice line items" ON public.invoice_line_items;
DROP POLICY IF EXISTS "Users and admins can delete invoice line items" ON public.invoice_line_items;
DROP POLICY IF EXISTS "Users can view invoice line items through invoices" ON public.invoice_line_items;
DROP POLICY IF EXISTS "Users can create invoice line items through invoices" ON public.invoice_line_items;
DROP POLICY IF EXISTS "Users can update invoice line items through invoices" ON public.invoice_line_items;
DROP POLICY IF EXISTS "Users can delete invoice line items through invoices" ON public.invoice_line_items;

-- Supporting tables
DROP POLICY IF EXISTS "Users and admins can view calendar events" ON public.calendar_events;
DROP POLICY IF EXISTS "Users and admins can create calendar events" ON public.calendar_events;
DROP POLICY IF EXISTS "Users and admins can update calendar events" ON public.calendar_events;
DROP POLICY IF EXISTS "Users and admins can delete calendar events" ON public.calendar_events;

DROP POLICY IF EXISTS "Users and admins can view activity logs" ON public.activity_logs;
DROP POLICY IF EXISTS "Users and admins can create activity logs" ON public.activity_logs;
DROP POLICY IF EXISTS "Users and admins can update activity logs" ON public.activity_logs;
DROP POLICY IF EXISTS "Users and admins can delete activity logs" ON public.activity_logs;
DROP POLICY IF EXISTS "activity_logs_select_policy" ON public.activity_logs;
DROP POLICY IF EXISTS "activity_logs_insert_policy" ON public.activity_logs;

DROP POLICY IF EXISTS "Users and admins can view documents" ON public.documents;
DROP POLICY IF EXISTS "Users and admins can create documents" ON public.documents;
DROP POLICY IF EXISTS "Users and admins can update documents" ON public.documents;
DROP POLICY IF EXISTS "Users and admins can delete documents" ON public.documents;

DROP POLICY IF EXISTS "Users and admins can view payments" ON public.payments;
DROP POLICY IF EXISTS "Users and admins can create payments" ON public.payments;
DROP POLICY IF EXISTS "Users and admins can update payments" ON public.payments;
DROP POLICY IF EXISTS "Users and admins can delete payments" ON public.payments;

-- Template and preference tables
DROP POLICY IF EXISTS "Users can view their own estimate templates" ON public.estimate_templates;
DROP POLICY IF EXISTS "Users can create their own estimate templates" ON public.estimate_templates;
DROP POLICY IF EXISTS "Users can update their own estimate templates" ON public.estimate_templates;
DROP POLICY IF EXISTS "Users can delete their own estimate templates" ON public.estimate_templates;

DROP POLICY IF EXISTS "Users can view their own line item templates" ON public.line_item_templates;
DROP POLICY IF EXISTS "Users can create their own line item templates" ON public.line_item_templates;
DROP POLICY IF EXISTS "Users can update their own line item templates" ON public.line_item_templates;
DROP POLICY IF EXISTS "Users can delete their own line item templates" ON public.line_item_templates;

DROP POLICY IF EXISTS "Users can view their own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Users can create their own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Users can update their own preferences" ON public.user_preferences;

-- Notification and dashboard tables
DROP POLICY IF EXISTS "user_notifications_select_policy" ON public.user_notifications;
DROP POLICY IF EXISTS "user_notifications_insert_policy" ON public.user_notifications;
DROP POLICY IF EXISTS "user_notifications_update_policy" ON public.user_notifications;
DROP POLICY IF EXISTS "user_notifications_delete_policy" ON public.user_notifications;

DROP POLICY IF EXISTS "notification_preferences_select_policy" ON public.notification_preferences;
DROP POLICY IF EXISTS "notification_preferences_insert_policy" ON public.notification_preferences;
DROP POLICY IF EXISTS "notification_preferences_update_policy" ON public.notification_preferences;

DROP POLICY IF EXISTS "dashboard_preferences_select_policy" ON public.dashboard_preferences;
DROP POLICY IF EXISTS "dashboard_preferences_insert_policy" ON public.dashboard_preferences;
DROP POLICY IF EXISTS "dashboard_preferences_update_policy" ON public.dashboard_preferences;

DROP POLICY IF EXISTS "dashboard_metrics_select_policy" ON public.dashboard_metrics_cache;
DROP POLICY IF EXISTS "dashboard_metrics_insert_policy" ON public.dashboard_metrics_cache;
DROP POLICY IF EXISTS "dashboard_metrics_update_policy" ON public.dashboard_metrics_cache;

DROP POLICY IF EXISTS "saved_searches_select_policy" ON public.saved_searches;
DROP POLICY IF EXISTS "saved_searches_insert_policy" ON public.saved_searches;
DROP POLICY IF EXISTS "saved_searches_update_policy" ON public.saved_searches;
DROP POLICY IF EXISTS "saved_searches_delete_policy" ON public.saved_searches;

DROP POLICY IF EXISTS "follow_up_reminders_select_policy" ON public.follow_up_reminders;
DROP POLICY IF EXISTS "follow_up_reminders_insert_policy" ON public.follow_up_reminders;
DROP POLICY IF EXISTS "follow_up_reminders_update_policy" ON public.follow_up_reminders;
DROP POLICY IF EXISTS "follow_up_reminders_delete_policy" ON public.follow_up_reminders;

-- Logo settings
DROP POLICY IF EXISTS "logo_settings_select_policy" ON public.logo_settings;
DROP POLICY IF EXISTS "logo_settings_insert_policy" ON public.logo_settings;
DROP POLICY IF EXISTS "logo_settings_update_policy" ON public.logo_settings;
DROP POLICY IF EXISTS "logo_settings_delete_policy" ON public.logo_settings;

-- Review and automation tables
DROP POLICY IF EXISTS "Users can view their own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can create their own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can update their own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can delete their own reviews" ON public.reviews;

DROP POLICY IF EXISTS "Users can view their own estimate automations" ON public.estimate_automations;
DROP POLICY IF EXISTS "Users can create their own estimate automations" ON public.estimate_automations;
DROP POLICY IF EXISTS "Users can update their own estimate automations" ON public.estimate_automations;
DROP POLICY IF EXISTS "Users can delete their own estimate automations" ON public.estimate_automations;

-- Calculator submissions
DROP POLICY IF EXISTS "Users can view their own calculator submissions" ON public.calculator_submissions;
DROP POLICY IF EXISTS "Anyone can create calculator submissions" ON public.calculator_submissions;
DROP POLICY IF EXISTS "Users can update their own calculator submissions" ON public.calculator_submissions;

-- =============================================================================
-- STEP 2: CREATE STANDARDIZED POLICIES FOR CORE CRM TABLES
-- =============================================================================

-- CUSTOMERS TABLE
CREATE POLICY "customers_owner_admin_select" ON public.customers
  FOR SELECT USING (auth.uid() = user_id OR is_admin(auth.uid()));

CREATE POLICY "customers_owner_insert" ON public.customers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "customers_owner_admin_update" ON public.customers
  FOR UPDATE USING (auth.uid() = user_id OR is_admin(auth.uid()));

CREATE POLICY "customers_owner_admin_delete" ON public.customers
  FOR DELETE USING (auth.uid() = user_id OR is_admin(auth.uid()));

-- LEADS TABLE
CREATE POLICY "leads_owner_admin_select" ON public.leads
  FOR SELECT USING (auth.uid() = user_id OR is_admin(auth.uid()));

CREATE POLICY "leads_owner_insert" ON public.leads
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "leads_owner_admin_update" ON public.leads
  FOR UPDATE USING (auth.uid() = user_id OR is_admin(auth.uid()));

CREATE POLICY "leads_owner_admin_delete" ON public.leads
  FOR DELETE USING (auth.uid() = user_id OR is_admin(auth.uid()));

-- JOBS TABLE
CREATE POLICY "jobs_owner_admin_select" ON public.jobs
  FOR SELECT USING (auth.uid() = user_id OR is_admin(auth.uid()));

CREATE POLICY "jobs_owner_insert" ON public.jobs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "jobs_owner_admin_update" ON public.jobs
  FOR UPDATE USING (auth.uid() = user_id OR is_admin(auth.uid()));

CREATE POLICY "jobs_owner_admin_delete" ON public.jobs
  FOR DELETE USING (auth.uid() = user_id OR is_admin(auth.uid()));

-- TASKS TABLE
CREATE POLICY "tasks_owner_admin_select" ON public.tasks
  FOR SELECT USING (auth.uid() = user_id OR is_admin(auth.uid()));

CREATE POLICY "tasks_owner_insert" ON public.tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "tasks_owner_admin_update" ON public.tasks
  FOR UPDATE USING (auth.uid() = user_id OR is_admin(auth.uid()));

CREATE POLICY "tasks_owner_admin_delete" ON public.tasks
  FOR DELETE USING (auth.uid() = user_id OR is_admin(auth.uid()));

-- ESTIMATES TABLE
CREATE POLICY "estimates_owner_admin_select" ON public.estimates
  FOR SELECT USING (auth.uid() = user_id OR is_admin(auth.uid()));

CREATE POLICY "estimates_owner_insert" ON public.estimates
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "estimates_owner_admin_update" ON public.estimates
  FOR UPDATE USING (auth.uid() = user_id OR is_admin(auth.uid()));

CREATE POLICY "estimates_owner_admin_delete" ON public.estimates
  FOR DELETE USING (auth.uid() = user_id OR is_admin(auth.uid()));

-- INVOICES TABLE
CREATE POLICY "invoices_owner_admin_select" ON public.invoices
  FOR SELECT USING (auth.uid() = user_id OR is_admin(auth.uid()));

CREATE POLICY "invoices_owner_insert" ON public.invoices
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "invoices_owner_admin_update" ON public.invoices
  FOR UPDATE USING (auth.uid() = user_id OR is_admin(auth.uid()));

CREATE POLICY "invoices_owner_admin_delete" ON public.invoices
  FOR DELETE USING (auth.uid() = user_id OR is_admin(auth.uid()));

-- =============================================================================
-- STEP 3: LINE ITEMS INHERIT FROM PARENT TABLE SECURITY
-- =============================================================================

-- ESTIMATE LINE ITEMS
CREATE POLICY "estimate_line_items_inherit_select" ON public.estimate_line_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.estimates 
      WHERE id = estimate_line_items.estimate_id 
      AND (user_id = auth.uid() OR is_admin(auth.uid()))
    )
  );

CREATE POLICY "estimate_line_items_inherit_insert" ON public.estimate_line_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.estimates 
      WHERE id = estimate_line_items.estimate_id 
      AND (user_id = auth.uid() OR is_admin(auth.uid()))
    )
  );

CREATE POLICY "estimate_line_items_inherit_update" ON public.estimate_line_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.estimates 
      WHERE id = estimate_line_items.estimate_id 
      AND (user_id = auth.uid() OR is_admin(auth.uid()))
    )
  );

CREATE POLICY "estimate_line_items_inherit_delete" ON public.estimate_line_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.estimates 
      WHERE id = estimate_line_items.estimate_id 
      AND (user_id = auth.uid() OR is_admin(auth.uid()))
    )
  );

-- INVOICE LINE ITEMS
CREATE POLICY "invoice_line_items_inherit_select" ON public.invoice_line_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.invoices 
      WHERE id = invoice_line_items.invoice_id 
      AND (user_id = auth.uid() OR is_admin(auth.uid()))
    )
  );

CREATE POLICY "invoice_line_items_inherit_insert" ON public.invoice_line_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.invoices 
      WHERE id = invoice_line_items.invoice_id 
      AND (user_id = auth.uid() OR is_admin(auth.uid()))
    )
  );

CREATE POLICY "invoice_line_items_inherit_update" ON public.invoice_line_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.invoices 
      WHERE id = invoice_line_items.invoice_id 
      AND (user_id = auth.uid() OR is_admin(auth.uid()))
    )
  );

CREATE POLICY "invoice_line_items_inherit_delete" ON public.invoice_line_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.invoices 
      WHERE id = invoice_line_items.invoice_id 
      AND (user_id = auth.uid() OR is_admin(auth.uid()))
    )
  );

-- =============================================================================
-- STEP 4: SUPPORTING TABLES - STANDARDIZED OWNER/ADMIN ACCESS
-- =============================================================================

-- CALENDAR EVENTS
CREATE POLICY "calendar_events_owner_admin_select" ON public.calendar_events
  FOR SELECT USING (auth.uid() = user_id OR is_admin(auth.uid()));

CREATE POLICY "calendar_events_owner_insert" ON public.calendar_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "calendar_events_owner_admin_update" ON public.calendar_events
  FOR UPDATE USING (auth.uid() = user_id OR is_admin(auth.uid()));

CREATE POLICY "calendar_events_owner_admin_delete" ON public.calendar_events
  FOR DELETE USING (auth.uid() = user_id OR is_admin(auth.uid()));

-- ACTIVITY LOGS (Admin can select all, users can only insert their own)
CREATE POLICY "activity_logs_admin_select" ON public.activity_logs
  FOR SELECT USING (is_admin(auth.uid()));

CREATE POLICY "activity_logs_owner_insert" ON public.activity_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- DOCUMENTS
CREATE POLICY "documents_owner_admin_select" ON public.documents
  FOR SELECT USING (auth.uid() = user_id OR is_admin(auth.uid()));

CREATE POLICY "documents_owner_insert" ON public.documents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "documents_owner_admin_update" ON public.documents
  FOR UPDATE USING (auth.uid() = user_id OR is_admin(auth.uid()));

CREATE POLICY "documents_owner_admin_delete" ON public.documents
  FOR DELETE USING (auth.uid() = user_id OR is_admin(auth.uid()));

-- PAYMENTS
CREATE POLICY "payments_owner_admin_select" ON public.payments
  FOR SELECT USING (auth.uid() = user_id OR is_admin(auth.uid()));

CREATE POLICY "payments_owner_insert" ON public.payments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "payments_owner_admin_update" ON public.payments
  FOR UPDATE USING (auth.uid() = user_id OR is_admin(auth.uid()));

CREATE POLICY "payments_owner_admin_delete" ON public.payments
  FOR DELETE USING (auth.uid() = user_id OR is_admin(auth.uid()));

-- =============================================================================
-- STEP 5: USER-SPECIFIC SETTINGS & PREFERENCES (OWNER ONLY)
-- =============================================================================

-- ESTIMATE TEMPLATES
CREATE POLICY "estimate_templates_owner_select" ON public.estimate_templates
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "estimate_templates_owner_insert" ON public.estimate_templates
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "estimate_templates_owner_update" ON public.estimate_templates
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "estimate_templates_owner_delete" ON public.estimate_templates
  FOR DELETE USING (auth.uid() = user_id);

-- LINE ITEM TEMPLATES
CREATE POLICY "line_item_templates_owner_select" ON public.line_item_templates
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "line_item_templates_owner_insert" ON public.line_item_templates
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "line_item_templates_owner_update" ON public.line_item_templates
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "line_item_templates_owner_delete" ON public.line_item_templates
  FOR DELETE USING (auth.uid() = user_id);

-- USER PREFERENCES
CREATE POLICY "user_preferences_owner_select" ON public.user_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "user_preferences_owner_insert" ON public.user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_preferences_owner_update" ON public.user_preferences
  FOR UPDATE USING (auth.uid() = user_id);

-- LOGO SETTINGS
CREATE POLICY "logo_settings_owner_select" ON public.logo_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "logo_settings_owner_insert" ON public.logo_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "logo_settings_owner_update" ON public.logo_settings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "logo_settings_owner_delete" ON public.logo_settings
  FOR DELETE USING (auth.uid() = user_id);

-- NOTIFICATIONS & DASHBOARD
CREATE POLICY "user_notifications_owner_select" ON public.user_notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "user_notifications_owner_insert" ON public.user_notifications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_notifications_owner_update" ON public.user_notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "user_notifications_owner_delete" ON public.user_notifications
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "notification_preferences_owner_select" ON public.notification_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "notification_preferences_owner_insert" ON public.notification_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "notification_preferences_owner_update" ON public.notification_preferences
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "dashboard_preferences_owner_select" ON public.dashboard_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "dashboard_preferences_owner_insert" ON public.dashboard_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "dashboard_preferences_owner_update" ON public.dashboard_preferences
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "dashboard_metrics_cache_owner_select" ON public.dashboard_metrics_cache
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "dashboard_metrics_cache_owner_insert" ON public.dashboard_metrics_cache
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "dashboard_metrics_cache_owner_update" ON public.dashboard_metrics_cache
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "saved_searches_owner_select" ON public.saved_searches
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "saved_searches_owner_insert" ON public.saved_searches
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "saved_searches_owner_update" ON public.saved_searches
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "saved_searches_owner_delete" ON public.saved_searches
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "follow_up_reminders_owner_select" ON public.follow_up_reminders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "follow_up_reminders_owner_insert" ON public.follow_up_reminders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "follow_up_reminders_owner_update" ON public.follow_up_reminders
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "follow_up_reminders_owner_delete" ON public.follow_up_reminders
  FOR DELETE USING (auth.uid() = user_id);

-- =============================================================================
-- STEP 6: SPECIAL CASE TABLES
-- =============================================================================

-- REVIEWS (Owner-only access)
CREATE POLICY "reviews_owner_select" ON public.reviews
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "reviews_owner_insert" ON public.reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "reviews_owner_update" ON public.reviews
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "reviews_owner_delete" ON public.reviews
  FOR DELETE USING (auth.uid() = user_id);

-- ESTIMATE AUTOMATIONS (Owner-only access)
CREATE POLICY "estimate_automations_owner_select" ON public.estimate_automations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "estimate_automations_owner_insert" ON public.estimate_automations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "estimate_automations_owner_update" ON public.estimate_automations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "estimate_automations_owner_delete" ON public.estimate_automations
  FOR DELETE USING (auth.uid() = user_id);

-- CALCULATOR SUBMISSIONS (Public insert, owner read/update)
CREATE POLICY "calculator_submissions_owner_select" ON public.calculator_submissions
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "calculator_submissions_public_insert" ON public.calculator_submissions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "calculator_submissions_owner_update" ON public.calculator_submissions
  FOR UPDATE USING (auth.uid() = user_id);

-- =============================================================================
-- STEP 7: ENSURE RLS IS ENABLED ON ALL TABLES
-- =============================================================================

-- Core tables
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estimates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estimate_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_line_items ENABLE ROW LEVEL SECURITY;

-- Supporting tables
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Template and preference tables
ALTER TABLE public.estimate_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.line_item_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logo_settings ENABLE ROW LEVEL SECURITY;

-- Notification and dashboard tables
ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dashboard_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dashboard_metrics_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follow_up_reminders ENABLE ROW LEVEL SECURITY;

-- Special tables
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estimate_automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calculator_submissions ENABLE ROW LEVEL SECURITY;
