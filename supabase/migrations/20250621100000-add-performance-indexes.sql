-- Performance Optimization: Add indexes for frequently queried tables
-- This migration adds indexes to improve query performance for dashboard, reporting, and filtering operations

-- ==========================================
-- PHASE 1: INDEXES FOR CORE ENTITY TABLES
-- ==========================================

-- Leads indexes
CREATE INDEX IF NOT EXISTS idx_leads_status_user_id
  ON public.leads(status, user_id);

CREATE INDEX IF NOT EXISTS idx_leads_created_at_user_id
  ON public.leads(created_at, user_id);

CREATE INDEX IF NOT EXISTS idx_leads_estimated_value
  ON public.leads(estimated_value, user_id);

-- Customers indexes
CREATE INDEX IF NOT EXISTS idx_customers_created_at_user_id
  ON public.customers(created_at, user_id);

CREATE INDEX IF NOT EXISTS idx_customers_status_user_id
  ON public.customers(status, user_id);

-- Jobs indexes
CREATE INDEX IF NOT EXISTS idx_jobs_status_user_id
  ON public.jobs(status, user_id);

CREATE INDEX IF NOT EXISTS idx_jobs_start_end_dates
  ON public.jobs(start_date, end_date, user_id);

CREATE INDEX IF NOT EXISTS idx_jobs_created_at_user_id
  ON public.jobs(created_at, user_id);

-- Estimates indexes
CREATE INDEX IF NOT EXISTS idx_estimates_status_user_id
  ON public.estimates(status, user_id);

CREATE INDEX IF NOT EXISTS idx_estimates_created_at_user_id
  ON public.estimates(created_at, user_id);

CREATE INDEX IF NOT EXISTS idx_estimates_customer_id_user_id
  ON public.estimates(customer_id, user_id);

-- Invoices indexes
CREATE INDEX IF NOT EXISTS idx_invoices_status_user_id
  ON public.invoices(status, user_id);

CREATE INDEX IF NOT EXISTS idx_invoices_due_date_user_id
  ON public.invoices(due_date, user_id);

CREATE INDEX IF NOT EXISTS idx_invoices_created_at_user_id
  ON public.invoices(created_at, user_id);

CREATE INDEX IF NOT EXISTS idx_invoices_customer_id_user_id
  ON public.invoices(customer_id, user_id);

CREATE INDEX IF NOT EXISTS idx_invoices_total_amount_status
  ON public.invoices(total_amount, status, user_id);

-- Tasks indexes
CREATE INDEX IF NOT EXISTS idx_tasks_status_user_id
  ON public.tasks(status, user_id);

CREATE INDEX IF NOT EXISTS idx_tasks_due_date_user_id
  ON public.tasks(due_date, user_id);

CREATE INDEX IF NOT EXISTS idx_tasks_priority_user_id
  ON public.tasks(priority, user_id);

-- ==========================================
-- PHASE 2: INDEXES FOR RELATIONSHIP TABLES
-- ==========================================

-- Estimate line items indexes
CREATE INDEX IF NOT EXISTS idx_estimate_line_items_estimate_id
  ON public.estimate_line_items(estimate_id);

-- Invoice line items indexes
CREATE INDEX IF NOT EXISTS idx_invoice_line_items_invoice_id
  ON public.invoice_line_items(invoice_id);

-- ==========================================
-- PHASE 3: INDEXES FOR AUDIT AND ACTIVITY LOGS
-- ==========================================

-- Activity logs indexes (additional to existing ones)
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity_type_entity_id
  ON public.activity_logs(entity_type, entity_id);

CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at_user_id
  ON public.activity_logs(created_at, user_id);

CREATE INDEX IF NOT EXISTS idx_activity_logs_action_user_id
  ON public.activity_logs(action, user_id);

-- Dashboard metrics cache indexes
CREATE INDEX IF NOT EXISTS idx_dashboard_metrics_cache_user_id_period
  ON public.dashboard_metrics_cache(user_id, period);

CREATE INDEX IF NOT EXISTS idx_dashboard_metrics_cache_expires_at
  ON public.dashboard_metrics_cache(expires_at);

CREATE INDEX IF NOT EXISTS idx_dashboard_metrics_cache_metric_type_user_id
  ON public.dashboard_metrics_cache(metric_type, user_id);
