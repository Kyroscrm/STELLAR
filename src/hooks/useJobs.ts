
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export type Job = Tables<'jobs'>;
type JobInsert = TablesInsert<'jobs'>;
type JobUpdate = TablesUpdate<'jobs'>;

// Define a type for the partial customer data we fetch
export interface JobCustomer {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  company_name: string;
}

export interface JobWithCustomer extends Job {
  customers?: JobCustomer | null;
}

export const useJobs = () => {
  const [jobs, setJobs] = useState<JobWithCustomer[]>([]);
  const [loading, setLoading] = useState(false);
  const { user, session } = useAuth();

  const fetchJobs = async () => {
    if (!user || !session) {
      console.log('No user or session available for fetching jobs');
      return;
    }
    
    setLoading(true);
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
            phone,
            company_name
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching jobs:', error);
        throw error;
      }
      
      console.log(`Fetched ${data?.length || 0} jobs`);
      setJobs(data || []);
    } catch (error: any) {
      console.error('Error fetching jobs:', error);
      toast.error('Failed to fetch jobs');
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const createJob = async (jobData: Omit<JobInsert, 'user_id'>) => {
    if (!user || !session) {
      toast.error('You must be logged in to create jobs');
      return null;
    }

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
            phone,
            company_name
          )
        `)
        .single();

      if (error) {
        console.error('Error creating job:', error);
        throw error;
      }
      
      console.log('Job created successfully:', data);
      setJobs(prev => [data, ...prev]);
      toast.success('Job created successfully');
      
      // Log activity
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
    if (!user || !session) {
      toast.error('You must be logged in to update jobs');
      return null;
    }

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
            phone,
            company_name
          )
        `)
        .single();

      if (error) {
        console.error('Error updating job:', error);
        throw error;
      }
      
      console.log('Job updated successfully:', data);
      setJobs(prev => prev.map(job => job.id === id ? data : job));
      toast.success('Job updated successfully');
      
      // Log activity
      await supabase.from('activity_logs').insert({
        user_id: user.id,
        entity_type: 'job',
        entity_id: id,
        action: 'updated',
        description: `Job updated`
      });

      return data;
    } catch (error: any) {
      console.error('Error updating job:', error);
      toast.error(error.message || 'Failed to update job');
      return null;
    }
  };

  const deleteJob = async (id: string) => {
    if (!user || !session) {
      toast.error('You must be logged in to delete jobs');
      return;
    }

    try {
      console.log('Deleting job:', id);
      
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting job:', error);
        throw error;
      }
      
      console.log('Job deleted successfully');
      setJobs(prev => prev.filter(job => job.id !== id));
      toast.success('Job deleted successfully');
      
      // Log activity
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
    if (user && session) {
      fetchJobs();
    }
  }, [user, session]);

  return {
    jobs,
    loading,
    fetchJobs,
    createJob,
    updateJob,
    deleteJob
  };
};
