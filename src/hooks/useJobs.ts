
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useActivityLogging } from '@/hooks/useActivityLogging';

export interface Job {
  id: string;
  title: string;
  description?: string;
  customer_id?: string;
  status?: 'quoted' | 'approved' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  start_date?: string;
  end_date?: string;
  estimated_hours?: number;
  actual_hours?: number;
  budget?: number;
  total_cost?: number;
  address?: string;
  notes?: string;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface JobWithCustomer extends Job {
  customers?: {
    id: string;
    first_name: string;
    last_name: string;
    email?: string;
    phone?: string;
  };
}

export const useJobs = () => {
  const [jobs, setJobs] = useState<JobWithCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { logActivity } = useActivityLogging();

  const fetchJobs = async () => {
    if (!user) {
      setJobs([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
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
        .order('created_at', { ascending: false });

      if (error) throw error;

      setJobs(data || []);
      console.log(`Fetched ${data?.length || 0} jobs`);
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  };

  const createJob = async (jobData: Omit<Job, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { data, error } = await supabase
        .from('jobs')
        .insert([{ ...jobData, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;

      await logActivity('create', 'job', data.id, `Created job: ${data.title}`);
      await fetchJobs();
      return data;
    } catch (err) {
      console.error('Error creating job:', err);
      throw err;
    }
  };

  const updateJob = async (id: string, updates: Partial<Job>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { data, error } = await supabase
        .from('jobs')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      await logActivity('update', 'job', id, `Updated job: ${data.title}`);
      await fetchJobs();
      return true;
    } catch (err) {
      console.error('Error updating job:', err);
      return false;
    }
  };

  const deleteJob = async (id: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await logActivity('delete', 'job', id, 'Deleted job');
      await fetchJobs();
      return true;
    } catch (err) {
      console.error('Error deleting job:', err);
      return false;
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
    deleteJob,
  };
};
