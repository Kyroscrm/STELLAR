
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useOptimisticUpdate } from './useOptimisticUpdate';
import { useErrorHandler } from './useErrorHandler';

export type Job = Tables<'jobs'>;
export type JobWithCustomer = Job & {
  customers?: {
    first_name: string;
    last_name: string;
    email?: string;
    phone?: string;
  };
};
type JobInsert = Omit<TablesInsert<'jobs'>, 'user_id'>;
type JobUpdate = TablesUpdate<'jobs'>;

export const useJobs = () => {
  const [jobs, setJobs] = useState<JobWithCustomer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { user, session } = useAuth();
  const { executeUpdate } = useOptimisticUpdate();
  const { handleError } = useErrorHandler();

  const validateUserAndSession = () => {
    if (!user || !session) {
      const errorMsg = 'Authentication required. Please log in again.';
      setError(new Error(errorMsg));
      toast.error(errorMsg);
      return false;
    }
    return true;
  };

  const fetchJobs = async () => {
    if (!validateUserAndSession()) return;
    
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
    } catch (error: any) {
      setError(error);
      handleError(error, { title: 'Failed to fetch jobs' });
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const createJob = async (jobData: JobInsert) => {
    if (!validateUserAndSession()) return null;

    const optimisticJob: JobWithCustomer = {
      id: `temp-${Date.now()}`,
      ...jobData,
      user_id: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    } as JobWithCustomer;

    try {
      return await executeUpdate(
        // Optimistic update
        () => setJobs(prev => [optimisticJob, ...prev]),
        // Actual update
        async () => {
          const { data, error } = await supabase
            .from('jobs')
            .insert({ ...jobData, user_id: user.id })
            .select(`
              *,
              customers (
                first_name,
                last_name,
                email,
                phone
              )
            `)
            .single();

          if (error) throw error;
          
          // Replace optimistic with real data
          setJobs(prev => prev.map(j => j.id === optimisticJob.id ? data : j));
          
          // Log activity
          await supabase.from('activity_logs').insert({
            user_id: user.id,
            entity_type: 'job',
            entity_id: data.id,
            action: 'created',
            description: `Job created: ${data.title}`
          });

          return data;
        },
        // Rollback
        () => setJobs(prev => prev.filter(j => j.id !== optimisticJob.id)),
        {
          successMessage: 'Job created successfully',
          errorMessage: 'Failed to create job'
        }
      );
    } catch (error: any) {
      return null;
    }
  };

  const updateJob = async (id: string, updates: JobUpdate) => {
    if (!validateUserAndSession()) return false;

    // Store original for rollback
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
            .select(`
              *,
              customers (
                first_name,
                last_name,
                email,
                phone
              )
            `)
            .single();

          if (error) throw error;
          
          // Update with real data
          setJobs(prev => prev.map(j => j.id === id ? data : j));
          
          // Log activity
          await supabase.from('activity_logs').insert({
            user_id: user.id,
            entity_type: 'job',
            entity_id: id,
            action: 'updated',
            description: `Job updated: ${data.title}`
          });

          return true;
        },
        // Rollback
        () => setJobs(prev => prev.map(j => j.id === id ? originalJob : j)),
        {
          successMessage: 'Job updated successfully',
          errorMessage: 'Failed to update job'
        }
      );
    } catch (error: any) {
      return false;
    }
  };

  const deleteJob = async (id: string) => {
    if (!validateUserAndSession()) return;

    // Store original for rollback
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
          
          // Log activity
          await supabase.from('activity_logs').insert({
            user_id: user.id,
            entity_type: 'job',
            entity_id: id,
            action: 'deleted',
            description: `Job deleted: ${originalJob.title}`
          });

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
    } catch (error: any) {
      // Error already handled by executeUpdate
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
