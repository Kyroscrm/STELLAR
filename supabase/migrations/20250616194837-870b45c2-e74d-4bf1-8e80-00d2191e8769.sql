
-- Phase 1: Clean up duplicate RLS policies and create logo settings table

-- Drop any existing duplicate RLS policies that might cause recursion
DROP POLICY IF EXISTS "Users can view their own customers" ON public.customers;
DROP POLICY IF EXISTS "Users can create their own customers" ON public.customers;
DROP POLICY IF EXISTS "Users can update their own customers" ON public.customers;
DROP POLICY IF EXISTS "Users can delete their own customers" ON public.customers;

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

DROP POLICY IF EXISTS "Users can view their own activity logs" ON public.activity_logs;
DROP POLICY IF EXISTS "Users can create their own activity logs" ON public.activity_logs;

DROP POLICY IF EXISTS "Users can view their own notifications" ON public.user_notifications;
DROP POLICY IF EXISTS "Users can create their own notifications" ON public.user_notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.user_notifications;
DROP POLICY IF EXISTS "Users can delete their own notifications" ON public.user_notifications;

DROP POLICY IF EXISTS "Users can view their own notification preferences" ON public.notification_preferences;
DROP POLICY IF EXISTS "Users can create their own notification preferences" ON public.notification_preferences;
DROP POLICY IF EXISTS "Users can update their own notification preferences" ON public.notification_preferences;

DROP POLICY IF EXISTS "Users can view their own dashboard metrics" ON public.dashboard_metrics_cache;
DROP POLICY IF EXISTS "Users can create their own dashboard metrics" ON public.dashboard_metrics_cache;
DROP POLICY IF EXISTS "Users can update their own dashboard metrics" ON public.dashboard_metrics_cache;

DROP POLICY IF EXISTS "Users can view their own reminders" ON public.follow_up_reminders;
DROP POLICY IF EXISTS "Users can create their own reminders" ON public.follow_up_reminders;
DROP POLICY IF EXISTS "Users can update their own reminders" ON public.follow_up_reminders;
DROP POLICY IF EXISTS "Users can delete their own reminders" ON public.follow_up_reminders;

DROP POLICY IF EXISTS "Users can view their own searches" ON public.saved_searches;
DROP POLICY IF EXISTS "Users can create their own searches" ON public.saved_searches;
DROP POLICY IF EXISTS "Users can update their own searches" ON public.saved_searches;
DROP POLICY IF EXISTS "Users can delete their own searches" ON public.saved_searches;

DROP POLICY IF EXISTS "Users can view their own dashboard preferences" ON public.dashboard_preferences;
DROP POLICY IF EXISTS "Users can create their own dashboard preferences" ON public.dashboard_preferences;
DROP POLICY IF EXISTS "Users can update their own dashboard preferences" ON public.dashboard_preferences;

-- Create logo_settings table for branding
CREATE TABLE IF NOT EXISTS public.logo_settings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  logo_url text,
  logo_position text DEFAULT 'top-center' CHECK (logo_position IN ('top-center', 'watermark', 'both')),
  logo_width integer DEFAULT 120 CHECK (logo_width BETWEEN 50 AND 300),
  logo_height integer DEFAULT 60 CHECK (logo_height BETWEEN 25 AND 150),
  watermark_opacity numeric DEFAULT 0.07 CHECK (watermark_opacity BETWEEN 0.01 AND 0.3),
  show_on_drafts boolean DEFAULT true,
  show_on_approved boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id)
);

-- Enable RLS on logo_settings
ALTER TABLE public.logo_settings ENABLE ROW LEVEL SECURITY;

-- Create standardized RLS policies for logo_settings
CREATE POLICY "logo_settings_select_policy" ON public.logo_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "logo_settings_insert_policy" ON public.logo_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "logo_settings_update_policy" ON public.logo_settings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "logo_settings_delete_policy" ON public.logo_settings FOR DELETE USING (auth.uid() = user_id);

-- Create function to update updated_at for logo_settings
CREATE OR REPLACE FUNCTION update_logo_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for logo_settings
CREATE TRIGGER update_logo_settings_updated_at
  BEFORE UPDATE ON public.logo_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_logo_settings_updated_at();
