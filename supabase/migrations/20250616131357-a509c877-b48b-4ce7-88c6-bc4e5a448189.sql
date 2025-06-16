
-- Create saved_searches table for Enhanced Global Search
CREATE TABLE public.saved_searches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  query TEXT NOT NULL,
  filters JSONB NOT NULL DEFAULT '{}',
  entity_types TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create dashboard_preferences table for Dashboard Customization
CREATE TABLE public.dashboard_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  layout JSONB NOT NULL DEFAULT '{}',
  widget_positions JSONB NOT NULL DEFAULT '{}',
  visible_widgets TEXT[] NOT NULL DEFAULT '{}',
  theme_settings JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_notifications table for Smart Notifications
CREATE TABLE public.user_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  priority TEXT NOT NULL DEFAULT 'medium',
  read BOOLEAN NOT NULL DEFAULT false,
  dismissed BOOLEAN NOT NULL DEFAULT false,
  action_url TEXT,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  read_at TIMESTAMP WITH TIME ZONE,
  dismissed_at TIMESTAMP WITH TIME ZONE
);

-- Create notification_preferences table
CREATE TABLE public.notification_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  email_notifications BOOLEAN NOT NULL DEFAULT true,
  push_notifications BOOLEAN NOT NULL DEFAULT true,
  notification_types JSONB NOT NULL DEFAULT '{}',
  quiet_hours JSONB NOT NULL DEFAULT '{}',
  frequency TEXT NOT NULL DEFAULT 'immediate',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create dashboard_metrics_cache table for performance
CREATE TABLE public.dashboard_metrics_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  metric_type TEXT NOT NULL,
  value NUMERIC NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}',
  period TEXT NOT NULL,
  calculated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  UNIQUE(user_id, metric_type, period)
);

-- Add RLS policies for saved_searches
ALTER TABLE public.saved_searches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own saved searches" 
  ON public.saved_searches 
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own saved searches" 
  ON public.saved_searches 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own saved searches" 
  ON public.saved_searches 
  FOR UPDATE 
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own saved searches" 
  ON public.saved_searches 
  FOR DELETE 
  USING (user_id = auth.uid());

-- Add RLS policies for dashboard_preferences
ALTER TABLE public.dashboard_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own dashboard preferences" 
  ON public.dashboard_preferences 
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own dashboard preferences" 
  ON public.dashboard_preferences 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own dashboard preferences" 
  ON public.dashboard_preferences 
  FOR UPDATE 
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own dashboard preferences" 
  ON public.dashboard_preferences 
  FOR DELETE 
  USING (user_id = auth.uid());

-- Add RLS policies for user_notifications
ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications" 
  ON public.user_notifications 
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own notifications" 
  ON public.user_notifications 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications" 
  ON public.user_notifications 
  FOR UPDATE 
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own notifications" 
  ON public.user_notifications 
  FOR DELETE 
  USING (user_id = auth.uid());

-- Add RLS policies for notification_preferences
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notification preferences" 
  ON public.notification_preferences 
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own notification preferences" 
  ON public.notification_preferences 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own notification preferences" 
  ON public.notification_preferences 
  FOR UPDATE 
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own notification preferences" 
  ON public.notification_preferences 
  FOR DELETE 
  USING (user_id = auth.uid());

-- Add RLS policies for dashboard_metrics_cache
ALTER TABLE public.dashboard_metrics_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own dashboard metrics cache" 
  ON public.dashboard_metrics_cache 
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own dashboard metrics cache" 
  ON public.dashboard_metrics_cache 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own dashboard metrics cache" 
  ON public.dashboard_metrics_cache 
  FOR UPDATE 
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own dashboard metrics cache" 
  ON public.dashboard_metrics_cache 
  FOR DELETE 
  USING (user_id = auth.uid());

-- Add indexes for performance
CREATE INDEX idx_saved_searches_user_id ON public.saved_searches(user_id);
CREATE INDEX idx_dashboard_preferences_user_id ON public.dashboard_preferences(user_id);
CREATE INDEX idx_user_notifications_user_id ON public.user_notifications(user_id);
CREATE INDEX idx_user_notifications_read ON public.user_notifications(user_id, read);
CREATE INDEX idx_notification_preferences_user_id ON public.notification_preferences(user_id);
CREATE INDEX idx_dashboard_metrics_cache_user_id ON public.dashboard_metrics_cache(user_id);
CREATE INDEX idx_dashboard_metrics_cache_expires ON public.dashboard_metrics_cache(expires_at);

-- Add triggers for updated_at timestamps
CREATE TRIGGER update_saved_searches_updated_at
  BEFORE UPDATE ON public.saved_searches
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_dashboard_preferences_updated_at
  BEFORE UPDATE ON public.dashboard_preferences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_notification_preferences_updated_at
  BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
