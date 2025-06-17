
-- First, let's check for existing RLS policies that might conflict
-- Drop any duplicate or conflicting policies to prevent recursion

-- Clean up estimate_templates policies (if they exist)
DROP POLICY IF EXISTS "Users can view their own estimate templates" ON public.estimate_templates;
DROP POLICY IF EXISTS "Users can create their own estimate templates" ON public.estimate_templates;
DROP POLICY IF EXISTS "Users can update their own estimate templates" ON public.estimate_templates;
DROP POLICY IF EXISTS "Users can delete their own estimate templates" ON public.estimate_templates;

-- Clean up line_item_templates policies (if they exist)
DROP POLICY IF EXISTS "Users can view their own line item templates" ON public.line_item_templates;
DROP POLICY IF EXISTS "Users can create their own line item templates" ON public.line_item_templates;
DROP POLICY IF EXISTS "Users can update their own line item templates" ON public.line_item_templates;
DROP POLICY IF EXISTS "Users can delete their own line item templates" ON public.line_item_templates;

-- Now create clean, non-conflicting RLS policies for estimate_templates
CREATE POLICY "estimate_templates_select_policy" 
  ON public.estimate_templates 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "estimate_templates_insert_policy" 
  ON public.estimate_templates 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "estimate_templates_update_policy" 
  ON public.estimate_templates 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "estimate_templates_delete_policy" 
  ON public.estimate_templates 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create clean, non-conflicting RLS policies for line_item_templates
CREATE POLICY "line_item_templates_select_policy" 
  ON public.line_item_templates 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "line_item_templates_insert_policy" 
  ON public.line_item_templates 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "line_item_templates_update_policy" 
  ON public.line_item_templates 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "line_item_templates_delete_policy" 
  ON public.line_item_templates 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Ensure RLS is enabled on both tables
ALTER TABLE public.estimate_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.line_item_templates ENABLE ROW LEVEL SECURITY;
