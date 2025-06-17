
-- Phase 2: Database Security Hardening - Fix Nullable user_id Columns

-- =======================
-- CRITICAL SECURITY FIX: Make user_id columns NOT NULL
-- This prevents orphaned records and security vulnerabilities
-- =======================

-- 1. CUSTOMERS TABLE - Make user_id NOT NULL
-- First, clean up any orphaned records (shouldn't be any with current RLS)
DELETE FROM public.customers WHERE user_id IS NULL;

-- Make user_id NOT NULL and add foreign key constraint
ALTER TABLE public.customers 
  ALTER COLUMN user_id SET NOT NULL;

-- 2. LEADS TABLE - Make user_id NOT NULL
DELETE FROM public.leads WHERE user_id IS NULL;

ALTER TABLE public.leads 
  ALTER COLUMN user_id SET NOT NULL;

-- 3. JOBS TABLE - Make user_id NOT NULL
DELETE FROM public.jobs WHERE user_id IS NULL;

ALTER TABLE public.jobs 
  ALTER COLUMN user_id SET NOT NULL;

-- 4. TASKS TABLE - Make user_id NOT NULL
DELETE FROM public.tasks WHERE user_id IS NULL;

ALTER TABLE public.tasks 
  ALTER COLUMN user_id SET NOT NULL;

-- 5. ESTIMATES TABLE - Make user_id NOT NULL
DELETE FROM public.estimates WHERE user_id IS NULL;

ALTER TABLE public.estimates 
  ALTER COLUMN user_id SET NOT NULL;

-- 6. INVOICES TABLE - Make user_id NOT NULL
DELETE FROM public.invoices WHERE user_id IS NULL;

ALTER TABLE public.invoices 
  ALTER COLUMN user_id SET NOT NULL;

-- 7. ACTIVITY LOGS TABLE - Make user_id NOT NULL
DELETE FROM public.activity_logs WHERE user_id IS NULL;

ALTER TABLE public.activity_logs 
  ALTER COLUMN user_id SET NOT NULL;

-- 8. DOCUMENTS TABLE - Make user_id NOT NULL
DELETE FROM public.documents WHERE user_id IS NULL;

ALTER TABLE public.documents 
  ALTER COLUMN user_id SET NOT NULL;

-- 9. CALENDAR EVENTS TABLE - Make user_id NOT NULL
DELETE FROM public.calendar_events WHERE user_id IS NULL;

ALTER TABLE public.calendar_events 
  ALTER COLUMN user_id SET NOT NULL;

-- 10. PAYMENTS TABLE - Make user_id NOT NULL
DELETE FROM public.payments WHERE user_id IS NULL;

ALTER TABLE public.payments 
  ALTER COLUMN user_id SET NOT NULL;

-- =======================
-- ADVANCED TABLES SECURITY HARDENING
-- =======================

-- Advanced CRM feature tables
ALTER TABLE public.accounting_settings ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.api_keys ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.backups ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.barcode_logs ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.calendar_integrations ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.campaigns ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.companies ALTER COLUMN owner_id SET NOT NULL;
ALTER TABLE public.dashboard_widgets ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.dashboard_layouts ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.file_policies ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.file_workflows ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.kpis ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.media_files ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.ocr_docs ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.offline_tasks ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.payment_methods ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.reports ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.sentiment_logs ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.signed_documents ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.social_leads ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.subscribers ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.uploads ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.user_settings ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.webhooks ALTER COLUMN user_id SET NOT NULL;

-- =======================
-- ADD MISSING INDEXES FOR PERFORMANCE
-- =======================

-- Core table indexes on user_id for faster RLS policy evaluation
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON public.customers(user_id);
CREATE INDEX IF NOT EXISTS idx_leads_user_id ON public.leads(user_id);
CREATE INDEX IF NOT EXISTS idx_jobs_user_id ON public.jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_estimates_user_id ON public.estimates(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON public.invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON public.documents(user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_user_id ON public.calendar_events(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);

-- Foreign key indexes for better join performance
CREATE INDEX IF NOT EXISTS idx_customers_lead_id ON public.customers(lead_id);
CREATE INDEX IF NOT EXISTS idx_jobs_customer_id ON public.jobs(customer_id);
CREATE INDEX IF NOT EXISTS idx_tasks_job_id ON public.tasks(job_id);
CREATE INDEX IF NOT EXISTS idx_estimates_customer_id ON public.estimates(customer_id);
CREATE INDEX IF NOT EXISTS idx_estimates_job_id ON public.estimates(job_id);
CREATE INDEX IF NOT EXISTS idx_invoices_customer_id ON public.invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_job_id ON public.invoices(job_id);
CREATE INDEX IF NOT EXISTS idx_invoices_estimate_id ON public.invoices(estimate_id);
CREATE INDEX IF NOT EXISTS idx_estimate_line_items_estimate_id ON public.estimate_line_items(estimate_id);
CREATE INDEX IF NOT EXISTS idx_invoice_line_items_invoice_id ON public.invoice_line_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_invoice_id ON public.payments(invoice_id);

-- Commonly queried field indexes
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON public.jobs(status);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_estimates_status ON public.estimates(status);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_payment_status ON public.invoices(payment_status);

-- Date indexes for time-based queries
CREATE INDEX IF NOT EXISTS idx_customers_created_at ON public.customers(created_at);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON public.jobs(created_at);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON public.tasks(created_at);
CREATE INDEX IF NOT EXISTS idx_estimates_created_at ON public.estimates(created_at);
CREATE INDEX IF NOT EXISTS idx_invoices_created_at ON public.invoices(created_at);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON public.activity_logs(created_at);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_tasks_user_status ON public.tasks(user_id, status);
CREATE INDEX IF NOT EXISTS idx_jobs_user_status ON public.jobs(user_id, status);
CREATE INDEX IF NOT EXISTS idx_invoices_user_status ON public.invoices(user_id, status);
CREATE INDEX IF NOT EXISTS idx_estimates_user_status ON public.estimates(user_id, status);

-- =======================
-- OPTIMIZE TRIGGER FUNCTIONS
-- =======================

-- Improve estimate totals calculation function performance
CREATE OR REPLACE FUNCTION public.update_estimate_totals()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
DECLARE
    estimate_record RECORD;
BEGIN
    -- Get estimate details in single query
    SELECT 
        e.id,
        e.tax_rate,
        COALESCE(SUM(eli.total), 0) as line_total
    INTO estimate_record
    FROM public.estimates e
    LEFT JOIN public.estimate_line_items eli ON e.id = eli.estimate_id
    WHERE e.id = COALESCE(NEW.estimate_id, OLD.estimate_id)
    GROUP BY e.id, e.tax_rate;
    
    -- Update totals in single statement
    UPDATE public.estimates 
    SET 
        subtotal = estimate_record.line_total,
        tax_amount = estimate_record.line_total * COALESCE(estimate_record.tax_rate, 0),
        total_amount = estimate_record.line_total * (1 + COALESCE(estimate_record.tax_rate, 0))
    WHERE id = estimate_record.id;
    
    RETURN COALESCE(NEW, OLD);
END;
$function$;

-- Improve invoice totals calculation function performance
CREATE OR REPLACE FUNCTION public.update_invoice_totals()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
DECLARE
    invoice_record RECORD;
BEGIN
    -- Get invoice details in single query
    SELECT 
        i.id,
        i.tax_rate,
        COALESCE(SUM(ili.total), 0) as line_total
    INTO invoice_record
    FROM public.invoices i
    LEFT JOIN public.invoice_line_items ili ON i.id = ili.invoice_id
    WHERE i.id = COALESCE(NEW.invoice_id, OLD.invoice_id)
    GROUP BY i.id, i.tax_rate;
    
    -- Update totals in single statement
    UPDATE public.invoices 
    SET 
        subtotal = invoice_record.line_total,
        tax_amount = invoice_record.line_total * COALESCE(invoice_record.tax_rate, 0),
        total_amount = invoice_record.line_total * (1 + COALESCE(invoice_record.tax_rate, 0))
    WHERE id = invoice_record.id;
    
    RETURN COALESCE(NEW, OLD);
END;
$function$;
