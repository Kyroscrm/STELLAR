
-- Create estimate_automations table for automation rules
CREATE TABLE public.estimate_automations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  estimate_id UUID REFERENCES public.estimates,
  name TEXT NOT NULL,
  trigger_type TEXT NOT NULL,
  action_type TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  conditions JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create line_item_templates table for reusable line items
CREATE TABLE public.line_item_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  unit_price NUMERIC NOT NULL DEFAULT 0,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create calculator_submissions table for estimate calculator leads
CREATE TABLE public.calculator_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  project_type TEXT NOT NULL,
  square_footage INTEGER,
  bathrooms INTEGER,
  timeline TEXT,
  budget TEXT,
  description TEXT,
  estimate_amount NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_preferences table for settings persistence
CREATE TABLE public.user_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL UNIQUE,
  discount_type TEXT DEFAULT 'percentage',
  default_discount_value NUMERIC DEFAULT 0,
  show_templates BOOLEAN DEFAULT false,
  preferences JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create reviews table for review management
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_date DATE NOT NULL,
  text_content TEXT NOT NULL,
  platform TEXT NOT NULL,
  verified BOOLEAN NOT NULL DEFAULT false,
  helpful_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.estimate_automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.line_item_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calculator_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for estimate_automations
CREATE POLICY "Users can view their own estimate automations" 
  ON public.estimate_automations 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own estimate automations" 
  ON public.estimate_automations 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own estimate automations" 
  ON public.estimate_automations 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own estimate automations" 
  ON public.estimate_automations 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create RLS policies for line_item_templates
CREATE POLICY "Users can view their own line item templates" 
  ON public.line_item_templates 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own line item templates" 
  ON public.line_item_templates 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own line item templates" 
  ON public.line_item_templates 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own line item templates" 
  ON public.line_item_templates 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create RLS policies for calculator_submissions
CREATE POLICY "Users can view their own calculator submissions" 
  ON public.calculator_submissions 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can create calculator submissions" 
  ON public.calculator_submissions 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Users can update their own calculator submissions" 
  ON public.calculator_submissions 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create RLS policies for user_preferences
CREATE POLICY "Users can view their own preferences" 
  ON public.user_preferences 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own preferences" 
  ON public.user_preferences 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" 
  ON public.user_preferences 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create RLS policies for reviews
CREATE POLICY "Users can view their own reviews" 
  ON public.reviews 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own reviews" 
  ON public.reviews 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews" 
  ON public.reviews 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews" 
  ON public.reviews 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Add triggers for updated_at columns
CREATE TRIGGER update_estimate_automations_updated_at 
  BEFORE UPDATE ON public.estimate_automations 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_line_item_templates_updated_at 
  BEFORE UPDATE ON public.line_item_templates 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at 
  BEFORE UPDATE ON public.user_preferences 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at 
  BEFORE UPDATE ON public.reviews 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
