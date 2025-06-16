
-- Phase 1: Clean up and standardize RLS policies
-- Remove existing policies to avoid conflicts and create clean, consistent ones

-- Clean up customers table policies
DROP POLICY IF EXISTS "Users can view their own customers" ON public.customers;
DROP POLICY IF EXISTS "Users can create their own customers" ON public.customers;
DROP POLICY IF EXISTS "Users can update their own customers" ON public.customers;
DROP POLICY IF EXISTS "Users can delete their own customers" ON public.customers;

-- Clean up leads table policies
DROP POLICY IF EXISTS "Users can view their own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can create their own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can update their own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can delete their own leads" ON public.leads;

-- Clean up jobs table policies
DROP POLICY IF EXISTS "Users can view their own jobs" ON public.jobs;
DROP POLICY IF EXISTS "Users can create their own jobs" ON public.jobs;
DROP POLICY IF EXISTS "Users can update their own jobs" ON public.jobs;
DROP POLICY IF EXISTS "Users can delete their own jobs" ON public.jobs;

-- Clean up tasks table policies
DROP POLICY IF EXISTS "Users can view their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can create their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can update their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can delete their own tasks" ON public.tasks;

-- Clean up estimates table policies
DROP POLICY IF EXISTS "Users can view their own estimates" ON public.estimates;
DROP POLICY IF EXISTS "Users can create their own estimates" ON public.estimates;
DROP POLICY IF EXISTS "Users can update their own estimates" ON public.estimates;
DROP POLICY IF EXISTS "Users can delete their own estimates" ON public.estimates;

-- Clean up invoices table policies
DROP POLICY IF EXISTS "Users can view their own invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users can create their own invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users can update their own invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users can delete their own invoices" ON public.invoices;

-- Clean up activity_logs table policies
DROP POLICY IF EXISTS "Users can view their own activity logs" ON public.activity_logs;
DROP POLICY IF EXISTS "Users can create their own activity logs" ON public.activity_logs;

-- Clean up user_notifications table policies
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.user_notifications;
DROP POLICY IF EXISTS "Users can create their own notifications" ON public.user_notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.user_notifications;
DROP POLICY IF EXISTS "Users can delete their own notifications" ON public.user_notifications;

-- Clean up notification_preferences table policies
DROP POLICY IF EXISTS "Users can view their own notification preferences" ON public.notification_preferences;
DROP POLICY IF EXISTS "Users can create their own notification preferences" ON public.notification_preferences;
DROP POLICY IF EXISTS "Users can update their own notification preferences" ON public.notification_preferences;

-- Clean up dashboard_metrics_cache table policies
DROP POLICY IF EXISTS "Users can view their own dashboard metrics" ON public.dashboard_metrics_cache;
DROP POLICY IF EXISTS "Users can create their own dashboard metrics" ON public.dashboard_metrics_cache;
DROP POLICY IF EXISTS "Users can update their own dashboard metrics" ON public.dashboard_metrics_cache;

-- Clean up follow_up_reminders table policies
DROP POLICY IF EXISTS "Users can view their own reminders" ON public.follow_up_reminders;
DROP POLICY IF EXISTS "Users can create their own reminders" ON public.follow_up_reminders;
DROP POLICY IF EXISTS "Users can update their own reminders" ON public.follow_up_reminders;
DROP POLICY IF EXISTS "Users can delete their own reminders" ON public.follow_up_reminders;

-- Clean up saved_searches table policies
DROP POLICY IF EXISTS "Users can view their own searches" ON public.saved_searches;
DROP POLICY IF EXISTS "Users can create their own searches" ON public.saved_searches;
DROP POLICY IF EXISTS "Users can update their own searches" ON public.saved_searches;
DROP POLICY IF EXISTS "Users can delete their own searches" ON public.saved_searches;

-- Clean up dashboard_preferences table policies
DROP POLICY IF EXISTS "Users can view their own dashboard preferences" ON public.dashboard_preferences;
DROP POLICY IF EXISTS "Users can create their own dashboard preferences" ON public.dashboard_preferences;
DROP POLICY IF EXISTS "Users can update their own dashboard preferences" ON public.dashboard_preferences;

-- Now create clean, standardized policies using consistent naming

-- Enable RLS on all core tables
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estimates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dashboard_metrics_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follow_up_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dashboard_preferences ENABLE ROW LEVEL SECURITY;

-- Create standardized policies for customers
CREATE POLICY "customers_select_policy" ON public.customers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "customers_insert_policy" ON public.customers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "customers_update_policy" ON public.customers FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "customers_delete_policy" ON public.customers FOR DELETE USING (auth.uid() = user_id);

-- Create standardized policies for leads
CREATE POLICY "leads_select_policy" ON public.leads FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "leads_insert_policy" ON public.leads FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "leads_update_policy" ON public.leads FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "leads_delete_policy" ON public.leads FOR DELETE USING (auth.uid() = user_id);

-- Create standardized policies for jobs
CREATE POLICY "jobs_select_policy" ON public.jobs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "jobs_insert_policy" ON public.jobs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "jobs_update_policy" ON public.jobs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "jobs_delete_policy" ON public.jobs FOR DELETE USING (auth.uid() = user_id);

-- Create standardized policies for tasks
CREATE POLICY "tasks_select_policy" ON public.tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "tasks_insert_policy" ON public.tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "tasks_update_policy" ON public.tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "tasks_delete_policy" ON public.tasks FOR DELETE USING (auth.uid() = user_id);

-- Create standardized policies for estimates
CREATE POLICY "estimates_select_policy" ON public.estimates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "estimates_insert_policy" ON public.estimates FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "estimates_update_policy" ON public.estimates FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "estimates_delete_policy" ON public.estimates FOR DELETE USING (auth.uid() = user_id);

-- Create standardized policies for invoices
CREATE POLICY "invoices_select_policy" ON public.invoices FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "invoices_insert_policy" ON public.invoices FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "invoices_update_policy" ON public.invoices FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "invoices_delete_policy" ON public.invoices FOR DELETE USING (auth.uid() = user_id);

-- Create standardized policies for activity_logs
CREATE POLICY "activity_logs_select_policy" ON public.activity_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "activity_logs_insert_policy" ON public.activity_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create standardized policies for user_notifications
CREATE POLICY "user_notifications_select_policy" ON public.user_notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_notifications_insert_policy" ON public.user_notifications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_notifications_update_policy" ON public.user_notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "user_notifications_delete_policy" ON public.user_notifications FOR DELETE USING (auth.uid() = user_id);

-- Create standardized policies for notification_preferences
CREATE POLICY "notification_preferences_select_policy" ON public.notification_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "notification_preferences_insert_policy" ON public.notification_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "notification_preferences_update_policy" ON public.notification_preferences FOR UPDATE USING (auth.uid() = user_id);

-- Create standardized policies for dashboard_metrics_cache
CREATE POLICY "dashboard_metrics_select_policy" ON public.dashboard_metrics_cache FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "dashboard_metrics_insert_policy" ON public.dashboard_metrics_cache FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "dashboard_metrics_update_policy" ON public.dashboard_metrics_cache FOR UPDATE USING (auth.uid() = user_id);

-- Create standardized policies for follow_up_reminders
CREATE POLICY "follow_up_reminders_select_policy" ON public.follow_up_reminders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "follow_up_reminders_insert_policy" ON public.follow_up_reminders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "follow_up_reminders_update_policy" ON public.follow_up_reminders FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "follow_up_reminders_delete_policy" ON public.follow_up_reminders FOR DELETE USING (auth.uid() = user_id);

-- Create standardized policies for saved_searches
CREATE POLICY "saved_searches_select_policy" ON public.saved_searches FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "saved_searches_insert_policy" ON public.saved_searches FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "saved_searches_update_policy" ON public.saved_searches FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "saved_searches_delete_policy" ON public.saved_searches FOR DELETE USING (auth.uid() = user_id);

-- Create standardized policies for dashboard_preferences
CREATE POLICY "dashboard_preferences_select_policy" ON public.dashboard_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "dashboard_preferences_insert_policy" ON public.dashboard_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "dashboard_preferences_update_policy" ON public.dashboard_preferences FOR UPDATE USING (auth.uid() = user_id);
