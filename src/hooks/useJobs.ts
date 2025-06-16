
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export type Job = Tables<'jobs'>;
type JobInsert = Omit<TablesInsert<'jobs'>, 'user_id'>;
type JobUpdate = TablesUpdate<'jobs'>;

// Extended Job type with customer data
export type JobWithCustomer = Job & {
  customers?: {
    id: string;
    first_name: string;
    last_name: string;
    email?: string;
    phone?: string;
  };
};

export const useJobs = () => {
  const [jobs, setJobs] = useState<JobWithCustomer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { user, session } = useAuth();

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
      console.log('Fetching jobs for user:', user.id);
      
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          customers (
            id,
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
      console.log(`Successfully fetched ${data?.length || 0} jobs`);
    } catch (error: any) {
      console.error('Error fetching jobs:', error);
      setError(error);
      toast.error('Failed to fetch jobs');
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

    // Optimistic update
    setJobs(prev => [optimisticJob, ...prev]);

    try {
      console.log('Creating job:', jobData);
      
      const { data, error } = await supabase
        .from('jobs')
        .insert({ ...jobData, user_id: user.id })
        .select(`
          *,
          customers (
            id,
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

      toast.success('Job created successfully');
      console.log('Job created successfully:', data);
      return data;
    } catch (error: any) {
      console.error('Error creating job:', error);
      // Rollback optimistic update
      setJobs(prev => prev.filter(j => j.id !== optimisticJob.id));
      toast.error(error.message || 'Failed to create job');
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

    // Optimistic update
    const optimisticJob = { ...originalJob, ...updates, updated_at: new Date().toISOString() };
    setJobs(prev => prev.map(j => j.id === id ? optimisticJob : j));

    try {
      console.log('Updating job:', id, updates);
      
      const { data, error } = await supabase
        .from('jobs')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select(`
          *,
          customers (
            id,
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

      toast.success('Job updated successfully');
      console.log('Job updated successfully:', data);
      return true;
    } catch (error: any) {
      console.error('Error updating job:', error);
      // Rollback optimistic update
      setJobs(prev => prev.map(j => j.id === id ? originalJob : j));
      toast.error(error.message || 'Failed to update job');
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

    // Optimistic update
    setJobs(prev => prev.filter(j => j.id !== id));

    try {
      console.log('Deleting job:', id);
      
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

      toast.success('Job deleted successfully');
      console.log('Job deleted successfully');
    } catch (error: any) {
      console.error('Error deleting job:', error);
      // Rollback optimistic update
      setJobs(prev => [...prev, originalJob].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ));
      toast.error(error.message || 'Failed to delete job');
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
