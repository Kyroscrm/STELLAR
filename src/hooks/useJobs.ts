import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useErrorHandler } from './useErrorHandler';
import { useOptimisticUpdate } from './useOptimisticUpdate';
import { useRBAC } from './useRBAC';
import { useEnhancedActivityLogs } from './useEnhancedActivityLogs';

export type Job = Tables<'jobs'>;
export type JobWithCustomer = Job & {
  customers?: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  };
};
type JobInsert = Omit<TablesInsert<'jobs'>, 'user_id'>;
type JobUpdate = TablesUpdate<'jobs'>;

export const useJobs = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { user, session } = useAuth();
  const { executeUpdate } = useOptimisticUpdate();
  const { handleError } = useErrorHandler();
  const { hasPermission } = useRBAC();
  const { logEntityChange } = useEnhancedActivityLogs();

  const validateUserAndSession = () => {
    if (!user || !session) {
      const errorMsg = 'Authentication required. Please log in again.';
      setError(new Error(errorMsg));
      toast.error(errorMsg);
      return false;
    }
    return true;
  };

  const validatePermission = (action: 'read' | 'write' | 'delete'): boolean => {
    const permission = `jobs:${action}`;
    if (!hasPermission(permission)) {
      toast.error(`You don't have permission to ${action} jobs`);
      return false;
    }
    return true;
  };

  const fetchJobs = async () => {
    if (!validateUserAndSession() || !validatePermission('read')) return;

    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          customers (
            first_name,
            last_name,
            email,
            phone
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setJobs(data || []);
    } catch (error: unknown) {
      const jobError = error instanceof Error ? error : new Error('Failed to fetch jobs');
      setError(jobError);
      handleError(jobError, { title: 'Failed to fetch jobs' });
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const createJob = async (jobData: JobInsert) => {
    if (!validateUserAndSession() || !validatePermission('write')) return null;

    const optimisticJob: Job = {
      id: `temp-${Date.now()}`,
      ...jobData,
      user_id: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    } as Job;

    try {
      return await executeUpdate(
        // Optimistic update
        () => setJobs(prev => [optimisticJob, ...prev]),
        // Actual update
        async () => {
          const { data, error } = await supabase
            .from('jobs')
            .insert({ ...jobData, user_id: user.id })
            .select()
            .single();

          if (error) throw error;

          // Replace optimistic with real data
          setJobs(prev => prev.map(j => j.id === optimisticJob.id ? data : j));

          // Enhanced activity logging
          await logEntityChange(
            'job',
            data.id,
            'created',
            null,
            data,
            `Job created: ${data.title}`
          );

          return data;
        },
        // Rollback
        () => setJobs(prev => prev.filter(j => j.id !== optimisticJob.id)),
        {
          successMessage: 'Job created successfully',
          errorMessage: 'Failed to create job'
        }
      );
    } catch (error: unknown) {
      return null;
    }
  };

  const updateJob = async (id: string, updates: JobUpdate) => {
    if (!validateUserAndSession() || !validatePermission('write')) return false;

    // Store original for rollback and change tracking
    const originalJob = jobs.find(j => j.id === id);
    if (!originalJob) {
      toast.error('Job not found');
      return false;
    }

    const optimisticJob = { ...originalJob, ...updates, updated_at: new Date().toISOString() };

    try {
      return await executeUpdate(
        // Optimistic update
        () => setJobs(prev => prev.map(j => j.id === id ? optimisticJob : j)),
        // Actual update
        async () => {
          const { data, error } = await supabase
            .from('jobs')
            .update(updates)
            .eq('id', id)
            .eq('user_id', user.id)
            .select()
            .single();

          if (error) throw error;

          // Update with real data
          setJobs(prev => prev.map(j => j.id === id ? data : j));

          // Enhanced activity logging with change tracking
          await logEntityChange(
            'job',
            id,
            'updated',
            originalJob,
            data,
            `Job updated: ${data.title}`
          );

          return true;
        },
        // Rollback
        () => setJobs(prev => prev.map(j => j.id === id ? originalJob : j)),
        {
          successMessage: 'Job updated successfully',
          errorMessage: 'Failed to update job'
        }
      );
    } catch (error: unknown) {
      return false;
    }
  };

  const deleteJob = async (id: string) => {
    if (!validateUserAndSession() || !validatePermission('delete')) return;

    // Store original for rollback and change tracking
    const originalJob = jobs.find(j => j.id === id);
    if (!originalJob) {
      toast.error('Job not found');
      return;
    }

    try {
      await executeUpdate(
        // Optimistic update
        () => setJobs(prev => prev.filter(j => j.id !== id)),
        // Actual update
        async () => {
          const { error } = await supabase
            .from('jobs')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id);

          if (error) throw error;

          // Enhanced activity logging
          await logEntityChange(
            'job',
            id,
            'deleted',
            originalJob,
            null,
            `Job deleted: ${originalJob.title}`
          );

          return true;
        },
        // Rollback
        () => setJobs(prev => [...prev, originalJob].sort((a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )),
        {
          successMessage: 'Job deleted successfully',
          errorMessage: 'Failed to delete job'
        }
      );
    } catch (error: unknown) {
      // Error handling is managed by executeUpdate
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [user, session]);

  return {
    jobs,
    loading,
    error,
    fetchJobs,
    createJob,
    updateJob,
    deleteJob
  };
};
