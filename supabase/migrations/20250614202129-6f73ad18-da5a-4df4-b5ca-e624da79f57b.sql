
-- Drop existing conflicting tables if they exist to avoid duplicates
DROP TABLE IF EXISTS public.accounting_settings CASCADE;
DROP TABLE IF EXISTS public.payment_methods CASCADE;
DROP TABLE IF EXISTS public.campaigns CASCADE;
DROP TABLE IF EXISTS public.subscribers CASCADE;
DROP TABLE IF EXISTS public.social_leads CASCADE;
DROP TABLE IF EXISTS public.workflows CASCADE;
DROP TABLE IF EXISTS public.workflow_logs CASCADE;
DROP TABLE IF EXISTS public.calendar_integrations CASCADE;
DROP TABLE IF EXISTS public.api_keys CASCADE;
DROP TABLE IF EXISTS public.webhooks CASCADE;
DROP TABLE IF EXISTS public.signed_documents CASCADE;
DROP TABLE IF EXISTS public.companies CASCADE;
DROP TABLE IF EXISTS public.themes CASCADE;
DROP TABLE IF EXISTS public.reports CASCADE;
DROP TABLE IF EXISTS public.kpis CASCADE;
DROP TABLE IF EXISTS public.dashboard_widgets CASCADE;
DROP TABLE IF EXISTS public.backups CASCADE;
DROP TABLE IF EXISTS public.user_settings CASCADE;
DROP TABLE IF EXISTS public.offline_tasks CASCADE;
DROP TABLE IF EXISTS public.uploads CASCADE;
DROP TABLE IF EXISTS public.media_files CASCADE;
DROP TABLE IF EXISTS public.barcode_logs CASCADE;
DROP TABLE IF EXISTS public.ocr_docs CASCADE;
DROP TABLE IF EXISTS public.sentiment_logs CASCADE;
DROP TABLE IF EXISTS public.dashboard_layouts CASCADE;

-- Create enums for various features
CREATE TYPE public.integration_status AS ENUM ('active', 'inactive', 'error', 'pending');
CREATE TYPE public.payment_method_type AS ENUM ('stripe', 'paypal', 'ach', 'credit_card');
CREATE TYPE public.campaign_status AS ENUM ('draft', 'active', 'paused', 'completed');
CREATE TYPE public.workflow_status AS ENUM ('active', 'inactive', 'error');
CREATE TYPE public.document_status AS ENUM ('pending', 'signed', 'expired', 'cancelled');
CREATE TYPE public.backup_status AS ENUM ('pending', 'completed', 'failed');
CREATE TYPE public.media_type AS ENUM ('photo', 'video', 'barcode', 'qr_code', 'document');

-- 1. Accounting Integration (QuickBooks, Xero)
CREATE TABLE public.accounting_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL, -- 'quickbooks', 'xero'
  access_token TEXT,
  refresh_token TEXT,
  company_id TEXT,
  auto_export_invoices BOOLEAN DEFAULT false,
  expense_mapping JSONB DEFAULT '{}',
  status integration_status DEFAULT 'inactive',
  last_sync TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, platform)
);

-- 2. Payment Gateway (Enhanced payments table)
CREATE TABLE public.payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type payment_method_type NOT NULL,
  provider_id TEXT, -- stripe customer id, paypal id, etc
  is_default BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Marketing Automation
CREATE TABLE public.campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'email', 'sms', 'social'
  subject TEXT,
  content TEXT,
  target_audience JSONB DEFAULT '{}',
  schedule_date TIMESTAMPTZ,
  status campaign_status DEFAULT 'draft',
  metrics JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  phone TEXT,
  tags TEXT[],
  status TEXT DEFAULT 'active', -- 'active', 'unsubscribed', 'bounced'
  source TEXT, -- 'website', 'import', 'manual'
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Social Media Integration
CREATE TABLE public.social_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL, -- 'facebook', 'linkedin', 'instagram'
  platform_lead_id TEXT,
  name TEXT,
  email TEXT,
  phone TEXT,
  message TEXT,
  campaign_source TEXT,
  metadata JSONB DEFAULT '{}',
  processed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Workflow Automation
CREATE TABLE public.workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  trigger_type TEXT NOT NULL, -- 'new_lead', 'job_completed', 'payment_received'
  trigger_conditions JSONB DEFAULT '{}',
  actions JSONB NOT NULL DEFAULT '[]',
  status workflow_status DEFAULT 'inactive',
  last_run TIMESTAMPTZ,
  run_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.workflow_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID REFERENCES public.workflows(id) ON DELETE CASCADE,
  trigger_data JSONB,
  actions_executed JSONB,
  success BOOLEAN,
  error_message TEXT,
  execution_time INTEGER, -- milliseconds
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Calendar Sync
CREATE TABLE public.calendar_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL, -- 'google', 'outlook'
  access_token TEXT,
  refresh_token TEXT,
  calendar_id TEXT,
  sync_enabled BOOLEAN DEFAULT true,
  last_sync TIMESTAMPTZ,
  status integration_status DEFAULT 'inactive',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, provider)
);

-- 7. API & Webhooks
CREATE TABLE public.api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL,
  permissions TEXT[] DEFAULT '{"read"}',
  last_used TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(key_hash)
);

CREATE TABLE public.webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  events TEXT[] NOT NULL,
  secret TEXT,
  active BOOLEAN DEFAULT true,
  last_triggered TIMESTAMPTZ,
  failure_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Document E-signature
CREATE TABLE public.signed_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  document_name TEXT NOT NULL,
  document_url TEXT NOT NULL,
  signer_email TEXT NOT NULL,
  signer_name TEXT,
  signature_data TEXT, -- base64 signature
  signed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  status document_status DEFAULT 'pending',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 9. Multi-tenancy, White Label, Branding
CREATE TABLE public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  domain TEXT,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#3B82F6',
  secondary_color TEXT DEFAULT '#10B981',
  custom_css TEXT,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(domain)
);

CREATE TABLE public.themes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  colors JSONB NOT NULL,
  fonts JSONB DEFAULT '{}',
  layout JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 10. Advanced Analytics / BI
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'revenue', 'performance', 'conversion'
  query JSONB NOT NULL,
  filters JSONB DEFAULT '{}',
  schedule JSONB, -- for automated reports
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.kpis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  value NUMERIC,
  target NUMERIC,
  unit TEXT,
  period TEXT, -- 'daily', 'weekly', 'monthly', 'yearly'
  date DATE DEFAULT CURRENT_DATE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.dashboard_widgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT NOT NULL, -- 'chart', 'metric', 'table', 'map'
  config JSONB NOT NULL,
  position_x INTEGER DEFAULT 0,
  position_y INTEGER DEFAULT 0,
  width INTEGER DEFAULT 4,
  height INTEGER DEFAULT 3,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 11. Backup, Recovery, Migration
CREATE TABLE public.backups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'manual', 'scheduled', 'migration'
  file_path TEXT,
  size_bytes BIGINT,
  tables_included TEXT[],
  status backup_status DEFAULT 'pending',
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- 12. Multi-language & Region Support
CREATE TABLE public.user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  language TEXT DEFAULT 'en',
  timezone TEXT DEFAULT 'UTC',
  currency TEXT DEFAULT 'USD',
  date_format TEXT DEFAULT 'MM/DD/YYYY',
  number_format TEXT DEFAULT 'US',
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- 13. Mobile-Only Features (PWA/Offline Mode)
CREATE TABLE public.offline_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL, -- 'create', 'update', 'delete'
  table_name TEXT NOT NULL,
  data JSONB NOT NULL,
  synced BOOLEAN DEFAULT false,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  synced_at TIMESTAMPTZ
);

CREATE TABLE public.uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  uploaded_offline BOOLEAN DEFAULT false,
  synced BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  synced_at TIMESTAMPTZ
);

-- 14. Barcode/QR/Photo Capture
CREATE TABLE public.media_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
  type media_type NOT NULL,
  file_path TEXT NOT NULL,
  thumbnail_path TEXT,
  metadata JSONB DEFAULT '{}', -- location, timestamp, device info
  extracted_data TEXT, -- for barcodes/QR codes
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.barcode_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
  barcode_value TEXT NOT NULL,
  barcode_type TEXT, -- 'QR', 'CODE128', etc
  scanned_at TIMESTAMPTZ DEFAULT now(),
  location JSONB, -- GPS coordinates if available
  metadata JSONB DEFAULT '{}'
);

-- 15. AI / Smart Features
CREATE TABLE public.ocr_docs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  extracted_text TEXT,
  confidence_score NUMERIC,
  language TEXT DEFAULT 'en',
  processed_at TIMESTAMPTZ DEFAULT now(),
  metadata JSONB DEFAULT '{}'
);

CREATE TABLE public.sentiment_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL, -- 'review', 'message', 'note'
  entity_id UUID NOT NULL,
  text_content TEXT NOT NULL,
  sentiment_score NUMERIC, -- -1 to 1
  sentiment_label TEXT, -- 'positive', 'negative', 'neutral'
  emotions JSONB, -- detailed emotion analysis
  processed_at TIMESTAMPTZ DEFAULT now()
);

-- 16. Custom Dashboard Builder
CREATE TABLE public.dashboard_layouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  layout JSONB NOT NULL, -- grid layout configuration
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.accounting_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.signed_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kpis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dashboard_widgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.backups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offline_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.barcode_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ocr_docs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sentiment_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dashboard_layouts ENABLE ROW LEVEL SECURITY;

-- Create comprehensive RLS policies for user access
CREATE POLICY "Users can manage their own accounting settings" ON public.accounting_settings FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own payment methods" ON public.payment_methods FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own campaigns" ON public.campaigns FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own subscribers" ON public.subscribers FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own social leads" ON public.social_leads FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own workflows" ON public.workflows FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view their workflow logs" ON public.workflow_logs FOR SELECT USING (EXISTS(SELECT 1 FROM public.workflows WHERE id = workflow_id AND user_id = auth.uid()));
CREATE POLICY "Users can manage their own calendar integrations" ON public.calendar_integrations FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own API keys" ON public.api_keys FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own webhooks" ON public.webhooks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own signed documents" ON public.signed_documents FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own companies" ON public.companies FOR ALL USING (auth.uid() = owner_id);
CREATE POLICY "Users can manage company themes" ON public.themes FOR ALL USING (EXISTS(SELECT 1 FROM public.companies WHERE id = company_id AND owner_id = auth.uid()));
CREATE POLICY "Users can manage their own reports" ON public.reports FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own KPIs" ON public.kpis FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own dashboard widgets" ON public.dashboard_widgets FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own backups" ON public.backups FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own settings" ON public.user_settings FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own offline tasks" ON public.offline_tasks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own uploads" ON public.uploads FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own media files" ON public.media_files FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own barcode logs" ON public.barcode_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own OCR docs" ON public.ocr_docs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own sentiment logs" ON public.sentiment_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own dashboard layouts" ON public.dashboard_layouts FOR ALL USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_accounting_settings_user_id ON public.accounting_settings(user_id);
CREATE INDEX idx_payment_methods_user_id ON public.payment_methods(user_id);
CREATE INDEX idx_campaigns_user_id ON public.campaigns(user_id);
CREATE INDEX idx_subscribers_user_id ON public.subscribers(user_id);
CREATE INDEX idx_social_leads_user_id ON public.social_leads(user_id);
CREATE INDEX idx_workflows_user_id ON public.workflows(user_id);
CREATE INDEX idx_workflow_logs_workflow_id ON public.workflow_logs(workflow_id);
CREATE INDEX idx_calendar_integrations_user_id ON public.calendar_integrations(user_id);
CREATE INDEX idx_api_keys_user_id ON public.api_keys(user_id);
CREATE INDEX idx_webhooks_user_id ON public.webhooks(user_id);
CREATE INDEX idx_signed_documents_user_id ON public.signed_documents(user_id);
CREATE INDEX idx_companies_owner_id ON public.companies(owner_id);
CREATE INDEX idx_themes_company_id ON public.themes(company_id);
CREATE INDEX idx_reports_user_id ON public.reports(user_id);
CREATE INDEX idx_kpis_user_id ON public.kpis(user_id);
CREATE INDEX idx_dashboard_widgets_user_id ON public.dashboard_widgets(user_id);
CREATE INDEX idx_backups_user_id ON public.backups(user_id);
CREATE INDEX idx_user_settings_user_id ON public.user_settings(user_id);
CREATE INDEX idx_offline_tasks_user_id ON public.offline_tasks(user_id);
CREATE INDEX idx_uploads_user_id ON public.uploads(user_id);
CREATE INDEX idx_media_files_user_id ON public.media_files(user_id);
CREATE INDEX idx_barcode_logs_user_id ON public.barcode_logs(user_id);
CREATE INDEX idx_ocr_docs_user_id ON public.ocr_docs(user_id);
CREATE INDEX idx_sentiment_logs_user_id ON public.sentiment_logs(user_id);
CREATE INDEX idx_dashboard_layouts_user_id ON public.dashboard_layouts(user_id);

-- Add triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_accounting_settings_updated_at BEFORE UPDATE ON public.accounting_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_payment_methods_updated_at BEFORE UPDATE ON public.payment_methods FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON public.campaigns FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_subscribers_updated_at BEFORE UPDATE ON public.subscribers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_workflows_updated_at BEFORE UPDATE ON public.workflows FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_calendar_integrations_updated_at BEFORE UPDATE ON public.calendar_integrations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_webhooks_updated_at BEFORE UPDATE ON public.webhooks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_signed_documents_updated_at BEFORE UPDATE ON public.signed_documents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON public.companies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_themes_updated_at BEFORE UPDATE ON public.themes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON public.reports FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_dashboard_widgets_updated_at BEFORE UPDATE ON public.dashboard_widgets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON public.user_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_dashboard_layouts_updated_at BEFORE UPDATE ON public.dashboard_layouts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
