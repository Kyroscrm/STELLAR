
-- Create enums for file workflow system
CREATE TYPE file_step_type AS ENUM ('upload', 'review', 'approve', 'organize', 'notify');

-- Create file_policies table
CREATE TABLE public.file_policies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  page_type TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  allowed_file_types TEXT[] DEFAULT '{}',
  max_file_size BIGINT DEFAULT 10485760, -- 10MB default
  max_files_per_entity INTEGER DEFAULT 10,
  require_approval BOOLEAN DEFAULT false,
  auto_organize BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create file_workflows table
CREATE TABLE public.file_workflows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  page_type TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create workflow_steps table
CREATE TABLE public.workflow_steps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workflow_id UUID REFERENCES public.file_workflows(id) ON DELETE CASCADE,
  step_order INTEGER NOT NULL,
  step_type file_step_type NOT NULL,
  step_config JSONB DEFAULT '{}',
  is_required BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.file_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.file_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_steps ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for file_policies
CREATE POLICY "Users can view their own file policies" 
  ON public.file_policies 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own file policies" 
  ON public.file_policies 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own file policies" 
  ON public.file_policies 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own file policies" 
  ON public.file_policies 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create RLS policies for file_workflows
CREATE POLICY "Users can view their own file workflows" 
  ON public.file_workflows 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own file workflows" 
  ON public.file_workflows 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own file workflows" 
  ON public.file_workflows 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own file workflows" 
  ON public.file_workflows 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create RLS policies for workflow_steps
CREATE POLICY "Users can view workflow steps for their workflows" 
  ON public.workflow_steps 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.file_workflows 
      WHERE id = workflow_steps.workflow_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create workflow steps for their workflows" 
  ON public.workflow_steps 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.file_workflows 
      WHERE id = workflow_steps.workflow_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update workflow steps for their workflows" 
  ON public.workflow_steps 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.file_workflows 
      WHERE id = workflow_steps.workflow_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete workflow steps for their workflows" 
  ON public.workflow_steps 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.file_workflows 
      WHERE id = workflow_steps.workflow_id 
      AND user_id = auth.uid()
    )
  );

-- Add updated_at triggers
CREATE TRIGGER update_file_policies_updated_at
  BEFORE UPDATE ON public.file_policies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_file_workflows_updated_at
  BEFORE UPDATE ON public.file_workflows
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
