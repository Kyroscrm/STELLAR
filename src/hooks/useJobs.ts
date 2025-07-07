import { useAuth } from '@/contexts/AuthContextExports';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useErrorHandler } from './useErrorHandler';
import { useOptimisticUpdate } from './useOptimisticUpdate';
import { useRBAC } from './useRBAC';
import { useAuditTrail } from './useAuditTrail';
import { JobStatus } from '@/types/supabase-enums';

export interface Customer {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
}

export interface Job {
  id: string;
  user_id: string;
  customer_id: string;
  title: string;
  description?: string;
  status: JobStatus;
  total_amount?: number;
  start_date?: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
  customers?: Customer;
  actual_hours?: number;
  estimated_hours?: number;
  budget?: number;
  notes?: string;
  address?: string;
}

export type JobInsert = Omit<Job, 'id' | 'user_id' | 'created_at' | 'updated_at'>;
export type JobUpdate = Partial<JobInsert>;

export const useJobs = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { user, session } = useAuth();
  const { executeUpdate } = useOptimisticUpdate();
  const { handleError } = useErrorHandler();
  const { hasPermission } = useRBAC();
  const { logActivity } = useAuditTrail();

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
    if (!validateUserAndSession() || !validatePermission('read')) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*, customers(first_name, last_name, email, phone)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setJobs((data || []) as Job[]);
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
    if (!validateUserAndSession() || !validatePermission('write')) return;

    try {
      const { data, error } = await supabase
        .from('jobs')
        .insert([{ ...jobData, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;

      const newJob = data as Job;
      setJobs(prev => [...prev, newJob]);
      await logActivity('job', newJob.id, 'created');
      toast.success('Job created successfully');
      return newJob;
    } catch (error: unknown) {
      const jobError = error instanceof Error ? error : new Error('Failed to create job');
      handleError(jobError, { title: 'Failed to create job' });
      throw jobError;
    }
  };

  const updateJob = async (id: string, updateData: JobUpdate) => {
    if (!validateUserAndSession() || !validatePermission('write')) return;

    try {
      const { data, error } = await supabase
        .from('jobs')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updatedJob = data as Job;
      setJobs(prev => prev.map(job => job.id === id ? updatedJob : job));
      await logActivity('job', id, 'updated');
      toast.success('Job updated successfully');
      return updatedJob;
    } catch (error: unknown) {
      const jobError = error instanceof Error ? error : new Error('Failed to update job');
      handleError(jobError, { title: 'Failed to update job' });
      throw jobError;
    }
  };

  const deleteJob = async (id: string) => {
    if (!validateUserAndSession() || !validatePermission('delete')) return;

    try {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setJobs(prev => prev.filter(job => job.id !== id));
      await logActivity('job', id, 'deleted');
      toast.success('Job deleted successfully');
    } catch (error: unknown) {
      const jobError = error instanceof Error ? error : new Error('Failed to delete job');
      handleError(jobError, { title: 'Failed to delete job' });
      throw jobError;
    }
  };

  useEffect(() => {
    if (user && session) {
      fetchJobs();
    }
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
