import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate, Json } from '@/integrations/supabase/types';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { ApiError, WorkflowStep } from '@/types/app-types';
import { useErrorHandler } from './useErrorHandler';
import { useOptimisticUpdate } from './useOptimisticUpdate';

// Explicitly define FileWorkflow to include the steps property
export interface FileWorkflow {
  id: string;
  name: string;
  page_type: string;
  entity_type: string;
  is_active: boolean;
  user_id: string;
  created_at: string | null;
  updated_at: string | null;
  steps: WorkflowStep[];
}

export interface FilePolicy {
  id: string;
  page_type: string;
  entity_type: string;
  allowed_file_types: string[];
  max_file_size: number;
  max_files_per_entity: number;
  require_approval: boolean;
  auto_organize: boolean;
  user_id: string;
  created_at: string | null;
  updated_at: string | null;
}

type FilePolicyInsert = Omit<TablesInsert<'file_policies'>, 'user_id'>;
type FilePolicyUpdate = TablesUpdate<'file_policies'>;
type FileWorkflowInsert = Omit<TablesInsert<'file_workflows'>, 'user_id'>;
type WorkflowStepInsert = Omit<TablesInsert<'workflow_steps'>, 'workflow_id'>;

interface UseFileWorkflowReturn {
  policies: FilePolicy[];
  workflows: FileWorkflow[];
  loading: boolean;
  error: Error | null;
  fetchPolicies: () => Promise<void>;
  fetchWorkflows: () => Promise<void>;
  createPolicy: (policyData: FilePolicyInsert) => Promise<FilePolicy | null>;
  createWorkflow: (workflowInput: FileWorkflowInsert, steps: WorkflowStepInsert[]) => Promise<FileWorkflow | null>;
  updatePolicy: (id: string, updates: FilePolicyUpdate) => Promise<FilePolicy | null>;
  deletePolicy: (id: string) => Promise<void>;
  validateFileUpload: (file: File, pageType: string, entityType: string) => { valid: boolean; message?: string };
}

const isSupabaseError = (error: unknown): error is ApiError => {
  return typeof error === 'object' && error !== null && 'error' in error && typeof (error as ApiError).error === 'object';
};

export const useFileWorkflow = (): UseFileWorkflowReturn => {
  const [policies, setPolicies] = useState<FilePolicy[]>([]);
  const [workflows, setWorkflows] = useState<FileWorkflow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { user, session } = useAuth();
  const { handleError } = useErrorHandler();
  const { executeUpdate } = useOptimisticUpdate();

  const validateUserAndSession = () => {
    if (!user || !session) {
      const errorMsg = 'Authentication required. Please log in again.';
      setError(new Error(errorMsg));
      toast.error(errorMsg);
      return false;
    }
    return true;
  };

  const fetchPolicies = async () => {
    if (!validateUserAndSession()) return;

    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('file_policies')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPolicies(data || []);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error);
        handleError(error, { title: 'Failed to fetch file policies' });
      } else if (isSupabaseError(error)) {
        const supabaseError = new Error(error.error.message);
        setError(supabaseError);
        handleError(supabaseError, { title: 'Failed to fetch file policies' });
      } else {
        const fallbackError = new Error('An unexpected error occurred while fetching file policies');
        setError(fallbackError);
        handleError(fallbackError, { title: 'Failed to fetch file policies' });
      }
      setPolicies([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkflows = async () => {
    if (!validateUserAndSession()) return;

    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('file_workflows')
        .select(`
          *,
          workflow_steps (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const workflowsWithSteps = data?.map((workflow: any): FileWorkflow => ({
        id: workflow.id,
        name: workflow.name,
        page_type: workflow.page_type,
        entity_type: workflow.entity_type,
        is_active: workflow.is_active,
        created_at: workflow.created_at,
        updated_at: workflow.updated_at,
        user_id: workflow.user_id,
        steps: workflow.workflow_steps || []
      })) || [];

      setWorkflows(workflowsWithSteps);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error);
        handleError(error, { title: 'Failed to fetch workflows' });
      } else if (isSupabaseError(error)) {
        const supabaseError = new Error(error.error.message);
        setError(supabaseError);
        handleError(supabaseError, { title: 'Failed to fetch workflows' });
      } else {
        const fallbackError = new Error('An unexpected error occurred while fetching workflows');
        setError(fallbackError);
        handleError(fallbackError, { title: 'Failed to fetch workflows' });
      }
      setWorkflows([]);
    } finally {
      setLoading(false);
    }
  };

  const createPolicy = async (policyData: FilePolicyInsert) => {
    if (!validateUserAndSession()) return null;

    try {
      const optimisticPolicy: FilePolicy = {
        id: `temp-${Date.now()}`,
        ...policyData,
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as FilePolicy;

      return await executeUpdate(
        // Optimistic update
        () => setPolicies(prev => [optimisticPolicy, ...prev]),
        // Actual update
        async () => {
          const { data, error } = await supabase
            .from('file_policies')
            .insert({ ...policyData, user_id: user.id })
            .select()
            .single();

          if (error) throw error;

          // Replace optimistic with real data
          setPolicies(prev => prev.map(p => p.id === optimisticPolicy.id ? data : p));
          return data;
        },
        // Rollback
        () => setPolicies(prev => prev.filter(p => p.id !== optimisticPolicy.id)),
        {
          successMessage: 'File policy created successfully',
          errorMessage: 'Failed to create file policy'
        }
      );
    } catch (error: unknown) {
      return null;
    }
  };

  const createWorkflow = async (workflowInput: FileWorkflowInsert, steps: WorkflowStepInsert[]) => {
    if (!validateUserAndSession()) return null;

    try {
      // This operation is complex and involves multiple steps, so we're not using optimistic updates
      setLoading(true);

      const { data: workflowResult, error: workflowError } = await supabase
        .from('file_workflows')
        .insert({ ...workflowInput, user_id: user.id })
        .select()
        .single();

      if (workflowError) throw workflowError;

      if (!workflowResult) {
        throw new Error('Failed to create workflow - no data returned');
      }

      // Insert workflow steps
      const stepsWithWorkflowId = steps.map(step => ({
        ...step,
        workflow_id: workflowResult.id
      }));

      const { data: workflowSteps, error: stepsError } = await supabase
        .from('workflow_steps')
        .insert(stepsWithWorkflowId)
        .select();

      if (stepsError) throw stepsError;

      // Construct a FileWorkflow object with steps
      const newWorkflow: FileWorkflow = {
        id: workflowResult.id,
        name: workflowResult.name,
        page_type: workflowResult.page_type,
        entity_type: workflowResult.entity_type,
        is_active: workflowResult.is_active,
        created_at: workflowResult.created_at,
        updated_at: workflowResult.updated_at,
        user_id: workflowResult.user_id,
        steps: workflowSteps || []
      };

      setWorkflows(prev => [newWorkflow, ...prev]);
      toast.success('Workflow created successfully');
      return newWorkflow;
    } catch (error: unknown) {
      if (error instanceof Error) {
        handleError(error, { title: 'Failed to create workflow' });
      } else if (isSupabaseError(error)) {
        const supabaseError = new Error(error.error.message);
        handleError(supabaseError, { title: 'Failed to create workflow' });
      } else {
        const fallbackError = new Error('An unexpected error occurred while creating workflow');
        handleError(fallbackError, { title: 'Failed to create workflow' });
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updatePolicy = async (id: string, updates: FilePolicyUpdate) => {
    if (!validateUserAndSession()) return null;

    // Find the original policy for rollback
    const originalPolicy = policies.find(p => p.id === id);
    if (!originalPolicy) {
      handleError(new Error('Policy not found'), { title: 'Failed to update policy' });
      return null;
    }

    // Create the optimistic update
    const optimisticPolicy = {
      ...originalPolicy,
      ...updates,
      updated_at: new Date().toISOString()
    };

    try {
      return await executeUpdate(
        // Optimistic update
        () => setPolicies(prev => prev.map(policy => policy.id === id ? optimisticPolicy : policy)),
        // Actual update
        async () => {
          const { data, error } = await supabase
            .from('file_policies')
            .update(updates)
            .eq('id', id)
            .eq('user_id', user.id)
            .select()
            .single();

          if (error) throw error;

          // Update with real data
          setPolicies(prev => prev.map(policy => policy.id === id ? data : policy));
          return data;
        },
        // Rollback
        () => setPolicies(prev => prev.map(policy => policy.id === id ? originalPolicy : policy)),
        {
          successMessage: 'Policy updated successfully',
          errorMessage: 'Failed to update policy'
        }
      );
    } catch (error: unknown) {
      return null;
    }
  };

  const deletePolicy = async (id: string) => {
    if (!validateUserAndSession()) return;

    // Find the original policy for rollback
    const originalPolicy = policies.find(p => p.id === id);
    if (!originalPolicy) {
      handleError(new Error('Policy not found'), { title: 'Failed to delete policy' });
      return;
    }

    try {
      await executeUpdate(
        // Optimistic update
        () => setPolicies(prev => prev.filter(policy => policy.id !== id)),
        // Actual update
        async () => {
          const { error } = await supabase
            .from('file_policies')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id);

          if (error) throw error;
          return true;
        },
        // Rollback
        () => setPolicies(prev => [...prev, originalPolicy].sort((a, b) =>
          new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()
        )),
        {
          successMessage: 'Policy deleted successfully',
          errorMessage: 'Failed to delete policy'
        }
      );
    } catch (error: unknown) {
      // Error handling is managed by executeUpdate
    }
  };

  const validateFileUpload = (file: File, pageType: string, entityType: string): { valid: boolean; message?: string } => {
    const policy = policies.find(p => p.page_type === pageType && p.entity_type === entityType);

    if (!policy) {
      return { valid: true }; // No policy means no restrictions
    }

    // Check file type
    if (policy.allowed_file_types && policy.allowed_file_types.length > 0) {
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      if (!fileExtension || !policy.allowed_file_types.includes(fileExtension)) {
        return {
          valid: false,
          message: `File type not allowed. Allowed types: ${policy.allowed_file_types.join(', ')}`
        };
      }
    }

    // Check file size
    if (policy.max_file_size && file.size > policy.max_file_size) {
      return {
        valid: false,
        message: `File too large. Maximum size: ${(policy.max_file_size / 1024 / 1024).toFixed(1)}MB`
      };
    }

    return { valid: true };
  };

  useEffect(() => {
    if (user && session) {
      fetchPolicies();
      fetchWorkflows();
    }
  }, [user, session]);

  return {
    policies,
    workflows,
    loading,
    error,
    fetchPolicies,
    fetchWorkflows,
    createPolicy,
    createWorkflow,
    updatePolicy,
    deletePolicy,
    validateFileUpload
  };
};
