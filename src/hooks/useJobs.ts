
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
  const { user } = useAuth();

  const fetchJobs = async () => {
    if (!user) {
      setJobs([]);
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
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
      console.log(`Fetched ${data?.length || 0} jobs`);
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
    if (!user) {
      toast.error('You must be logged in to create jobs');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('jobs')
        .insert({ ...jobData, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      
      setJobs(prev => [data, ...prev]);
      toast.success('Job created successfully');
      
      await supabase.from('activity_logs').insert({
        user_id: user.id,
        entity_type: 'job',
        entity_id: data.id,
        action: 'created',
        description: `Job created: ${data.title}`
      });

      return data;
    } catch (error: any) {
      console.error('Error creating job:', error);
      toast.error(error.message || 'Failed to create job');
      return null;
    }
  };

  const updateJob = async (id: string, updates: JobUpdate) => {
    if (!user) {
      toast.error('You must be logged in to update jobs');
      return false;
    }

    try {
      const { data, error } = await supabase
        .from('jobs')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      
      setJobs(prev => prev.map(job => job.id === id ? data : job));
      toast.success('Job updated successfully');
      
      await supabase.from('activity_logs').insert({
        user_id: user.id,
        entity_type: 'job',
        entity_id: id,
        action: 'updated',
        description: `Job updated`
      });

      return true;
    } catch (error: any) {
      console.error('Error updating job:', error);
      toast.error(error.message || 'Failed to update job');
      return false;
    }
  };

  const deleteJob = async (id: string) => {
    if (!user) {
      toast.error('You must be logged in to delete jobs');
      return;
    }

    try {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      
      setJobs(prev => prev.filter(job => job.id !== id));
      toast.success('Job deleted successfully');
      
      await supabase.from('activity_logs').insert({
        user_id: user.id,
        entity_type: 'job',
        entity_id: id,
        action: 'deleted',
        description: `Job deleted`
      });
    } catch (error: any) {
      console.error('Error deleting job:', error);
      toast.error(error.message || 'Failed to delete job');
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [user]);

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
