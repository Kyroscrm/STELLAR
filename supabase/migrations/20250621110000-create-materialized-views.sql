-- Performance Optimization: Create materialized views for complex aggregations
-- This migration adds materialized views to improve performance for dashboard metrics and reports

-- ==========================================
-- PHASE 1: MATERIALIZED VIEWS FOR REVENUE METRICS
-- ==========================================

-- Monthly revenue aggregation
CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_monthly_revenue AS
SELECT
  user_id,
  date_trunc('month', created_at) AS month,
  SUM(total_amount) AS total_revenue,
  COUNT(*) AS invoice_count,
  SUM(CASE WHEN status = 'paid' THEN total_amount ELSE 0 END) AS paid_revenue,
  COUNT(CASE WHEN status = 'paid' THEN 1 END) AS paid_invoice_count
FROM public.invoices
GROUP BY user_id, date_trunc('month', created_at);

-- Create index on the materialized view for faster lookups
CREATE INDEX IF NOT EXISTS idx_mv_monthly_revenue_user_id_month
  ON public.mv_monthly_revenue(user_id, month);

-- ==========================================
-- PHASE 2: MATERIALIZED VIEWS FOR LEAD CONVERSION METRICS
-- ==========================================

-- Lead conversion metrics
CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_lead_conversion_metrics AS
SELECT
  user_id,
  date_trunc('month', leads.created_at) AS month,
  COUNT(leads.id) AS total_leads,
  COUNT(CASE WHEN leads.status = 'won' THEN 1 END) AS converted_leads,
  CASE
    WHEN COUNT(leads.id) > 0 THEN
      ROUND((COUNT(CASE WHEN leads.status = 'won' THEN 1 END)::numeric / COUNT(leads.id)::numeric) * 100, 2)
    ELSE 0
  END AS conversion_rate,
  SUM(leads.estimated_value) AS total_pipeline_value,
  SUM(CASE WHEN leads.status = 'won' THEN leads.estimated_value ELSE 0 END) AS won_pipeline_value,
  CASE
    WHEN COUNT(leads.id) > 0 THEN
      ROUND(SUM(leads.estimated_value)::numeric / COUNT(leads.id)::numeric, 2)
    ELSE 0
  END AS average_lead_value
FROM public.leads
GROUP BY user_id, date_trunc('month', leads.created_at);

-- Create index on the materialized view for faster lookups
CREATE INDEX IF NOT EXISTS idx_mv_lead_conversion_metrics_user_id_month
  ON public.mv_lead_conversion_metrics(user_id, month);

-- ==========================================
-- PHASE 3: MATERIALIZED VIEWS FOR ESTIMATE METRICS
-- ==========================================

-- Estimate conversion metrics
CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_estimate_metrics AS
SELECT
  user_id,
  date_trunc('month', estimates.created_at) AS month,
  COUNT(estimates.id) AS total_estimates,
  COUNT(CASE WHEN estimates.status = 'approved' THEN 1 END) AS approved_estimates,
  CASE
    WHEN COUNT(estimates.id) > 0 THEN
      ROUND((COUNT(CASE WHEN estimates.status = 'approved' THEN 1 END)::numeric / COUNT(estimates.id)::numeric) * 100, 2)
    ELSE 0
  END AS approval_rate,
  SUM(estimates.total_amount) AS total_estimate_value,
  SUM(CASE WHEN estimates.status = 'approved' THEN estimates.total_amount ELSE 0 END) AS approved_estimate_value,
  COUNT(DISTINCT estimates.customer_id) AS unique_customers
FROM public.estimates
GROUP BY user_id, date_trunc('month', estimates.created_at);

-- Create index on the materialized view for faster lookups
CREATE INDEX IF NOT EXISTS idx_mv_estimate_metrics_user_id_month
  ON public.mv_estimate_metrics(user_id, month);

-- ==========================================
-- PHASE 4: MATERIALIZED VIEWS FOR ACTIVITY METRICS
-- ==========================================

-- User activity metrics
CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_user_activity_metrics AS
SELECT
  user_id,
  date_trunc('day', created_at) AS day,
  COUNT(*) AS total_activities,
  COUNT(DISTINCT entity_type) AS unique_entity_types,
  COUNT(DISTINCT entity_id) AS unique_entities,
  COUNT(DISTINCT action) AS unique_actions,
  COUNT(CASE WHEN action = 'create' THEN 1 END) AS create_actions,
  COUNT(CASE WHEN action = 'update' THEN 1 END) AS update_actions,
  COUNT(CASE WHEN action = 'delete' THEN 1 END) AS delete_actions
FROM public.activity_logs
GROUP BY user_id, date_trunc('day', created_at);

-- Create index on the materialized view for faster lookups
CREATE INDEX IF NOT EXISTS idx_mv_user_activity_metrics_user_id_day
  ON public.mv_user_activity_metrics(user_id, day);

-- ==========================================
-- PHASE 5: MATERIALIZED VIEW FOR DASHBOARD STATS
-- ==========================================

-- Dashboard summary stats
CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_dashboard_summary AS
SELECT
  user_id,
  COUNT(DISTINCT c.id) AS total_customers,
  COUNT(DISTINCT l.id) AS total_leads,
  COUNT(DISTINCT j.id) AS total_jobs,
  COUNT(DISTINCT e.id) AS total_estimates,
  COUNT(DISTINCT i.id) AS total_invoices,
  COUNT(DISTINCT t.id) AS total_tasks,
  COUNT(DISTINCT CASE WHEN t.status = 'pending' THEN t.id END) AS pending_tasks,
  COUNT(DISTINCT CASE WHEN e.status = 'draft' THEN e.id END) AS draft_estimates,
  COUNT(DISTINCT CASE WHEN i.status = 'paid' THEN i.id END) AS paid_invoices,
  COALESCE(SUM(CASE WHEN i.status = 'paid' THEN i.total_amount ELSE 0 END), 0) AS total_revenue
FROM public.profiles p
LEFT JOIN public.customers c ON p.id = c.user_id
LEFT JOIN public.leads l ON p.id = l.user_id
LEFT JOIN public.jobs j ON p.id = j.user_id
LEFT JOIN public.estimates e ON p.id = e.user_id
LEFT JOIN public.invoices i ON p.id = i.user_id
LEFT JOIN public.tasks t ON p.id = t.user_id
GROUP BY user_id;

-- Create index on the materialized view for faster lookups
CREATE INDEX IF NOT EXISTS idx_mv_dashboard_summary_user_id
  ON public.mv_dashboard_summary(user_id);

-- ==========================================
-- PHASE 6: CREATE REFRESH FUNCTION
-- ==========================================

-- Create a function to refresh all materialized views
CREATE OR REPLACE FUNCTION public.refresh_materialized_views()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW public.mv_monthly_revenue;
  REFRESH MATERIALIZED VIEW public.mv_lead_conversion_metrics;
  REFRESH MATERIALIZED VIEW public.mv_estimate_metrics;
  REFRESH MATERIALIZED VIEW public.mv_user_activity_metrics;
  REFRESH MATERIALIZED VIEW public.mv_dashboard_summary;
END;
$$;
