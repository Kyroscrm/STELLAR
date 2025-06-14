
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface FilePolicy {
  id: string;
  page_type: string;
  entity_type: string;
  allowed_file_types: string[];
  max_file_size: number;
  max_files_per_entity: number;
  require_approval: boolean;
  auto_organize: boolean;
  created_at: string;
  updated_at: string;
}

export interface WorkflowStep {
  id: string;
  workflow_id: string;
  step_order: number;
  step_type: 'upload' | 'review' | 'approve' | 'organize' | 'notify';
  step_config: any;
  is_required: boolean;
}

export interface FileWorkflow {
  id: string;
  name: string;
  page_type: string;
  entity_type: string;
  is_active: boolean;
  steps: WorkflowStep[];
  created_at: string;
  updated_at: string;
}

export const useFileWorkflow = () => {
  const [policies, setPolicies] = useState<FilePolicy[]>([]);
  const [workflows, setWorkflows] = useState<FileWorkflow[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchPolicies = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('file_policies' as any)
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPolicies(data as FilePolicy[] || []);
    } catch (error: any) {
      console.error('Error fetching file policies:', error);
      toast.error('Failed to fetch file policies');
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkflows = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('file_workflows' as any)
        .select(`
          *,
          workflow_steps (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const workflowsWithSteps = data?.map((workflow: any) => ({
        ...workflow,
        steps: workflow.workflow_steps || []
      })) || [];
      
      setWorkflows(workflowsWithSteps as FileWorkflow[]);
    } catch (error: any) {
      console.error('Error fetching workflows:', error);
      toast.error('Failed to fetch workflows');
    } finally {
      setLoading(false);
    }
  };

  const createPolicy = async (policyData: Omit<FilePolicy, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('file_policies' as any)
        .insert({ ...policyData, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      
      setPolicies(prev => [data as FilePolicy, ...prev]);
      toast.success('File policy created successfully');
      return data;
    } catch (error: any) {
      console.error('Error creating file policy:', error);
      toast.error('Failed to create file policy');
      return null;
    }
  };

  const createWorkflow = async (workflowData: Omit<FileWorkflow, 'id' | 'created_at' | 'updated_at' | 'steps'>, steps: Omit<WorkflowStep, 'id' | 'workflow_id'>[]) => {
    if (!user) return null;

    try {
      const { data: workflow, error: workflowError } = await supabase
        .from('file_workflows' as any)
        .insert({ ...workflowData, user_id: user.id })
        .select()
        .single();

      if (workflowError) throw workflowError;

      // Insert workflow steps
      const stepsWithWorkflowId = steps.map(step => ({
        ...step,
        workflow_id: workflow.id
      }));

      const { data: workflowSteps, error: stepsError } = await supabase
        .from('workflow_steps' as any)
        .insert(stepsWithWorkflowId)
        .select();

      if (stepsError) throw stepsError;

      const newWorkflow = { ...workflow, steps: workflowSteps };
      setWorkflows(prev => [newWorkflow as FileWorkflow, ...prev]);
      toast.success('Workflow created successfully');
      return newWorkflow;
    } catch (error: any) {
      console.error('Error creating workflow:', error);
      toast.error('Failed to create workflow');
      return null;
    }
  };

  const updatePolicy = async (id: string, updates: Partial<FilePolicy>) => {
    try {
      const { data, error } = await supabase
        .from('file_policies' as any)
        .update(updates)
        .eq('id', id)
        .eq('user_id', user?.id)
        .select()
        .single();

      if (error) throw error;
      
      setPolicies(prev => prev.map(policy => policy.id === id ? data as FilePolicy : policy));
      toast.success('Policy updated successfully');
      return data;
    } catch (error: any) {
      console.error('Error updating policy:', error);
      toast.error('Failed to update policy');
      return null;
    }
  };

  const deletePolicy = async (id: string) => {
    try {
      const { error } = await supabase
        .from('file_policies' as any)
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;
      
      setPolicies(prev => prev.filter(policy => policy.id !== id));
      toast.success('Policy deleted successfully');
    } catch (error: any) {
      console.error('Error deleting policy:', error);
      toast.error('Failed to delete policy');
    }
  };

  const validateFileUpload = (file: File, pageType: string, entityType: string): { valid: boolean; message?: string } => {
    const policy = policies.find(p => p.page_type === pageType && p.entity_type === entityType);
    
    if (!policy) {
      return { valid: true }; // No policy means no restrictions
    }

    // Check file type
    if (policy.allowed_file_types.length > 0) {
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      if (!fileExtension || !policy.allowed_file_types.includes(fileExtension)) {
        return { 
          valid: false, 
          message: `File type not allowed. Allowed types: ${policy.allowed_file_types.join(', ')}` 
        };
      }
    }

    // Check file size
    if (file.size > policy.max_file_size) {
      return { 
        valid: false, 
        message: `File too large. Maximum size: ${(policy.max_file_size / 1024 / 1024).toFixed(1)}MB` 
      };
    }

    return { valid: true };
  };

  useEffect(() => {
    if (user) {
      fetchPolicies();
      fetchWorkflows();
    }
  }, [user]);

  return {
    policies,
    workflows,
    loading,
    fetchPolicies,
    fetchWorkflows,
    createPolicy,
    createWorkflow,
    updatePolicy,
    deletePolicy,
    validateFileUpload
  };
};
