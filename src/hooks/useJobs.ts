
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useActivityLogs } from '@/hooks/useActivityLogs';
import { toast } from 'sonner';

export interface Job {
  id: string;
  user_id: string;
  customer_id?: string;
  title: string;
  description?: string;
  status: 'quoted' | 'approved' | 'in_progress' | 'completed' | 'cancelled';
  start_date?: string;
  end_date?: string;
  estimated_hours?: number;
  actual_hours?: number;
  budget?: number;
  total_cost?: number;
  address?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export const useJobs = () => {
  const { user } = useAuth();
  const { logActivity } = useActivityLogs();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchJobs = async () => {
    if (!user) return;

    setLoading(true);
    try {
      console.log('Fetching jobs for user:', user.id);
      
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setJobs(data || []);
      console.log(`Successfully fetched ${data?.length || 0} jobs`);
    } catch (error: any) {
      console.error('Error fetching jobs:', error);
      toast.error('Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  };

  const createJob = async (jobData: Omit<Job, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) {
      toast.error('Authentication required');
      return null;
    }

    // Optimistic update
    const tempJob: Job = {
      ...jobData,
      id: `temp-${Date.now()}`,
      user_id: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setJobs(prev => [tempJob, ...prev]);

    try {
      console.log('Creating job:', jobData);
      
      const { data, error } = await supabase
        .from('jobs')
        .insert({
          ...jobData,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      // Replace optimistic update with real data
      setJobs(prev => prev.map(j => j.id === tempJob.id ? data : j));
      
      await logActivity('create', 'job', data.id, `Created job: ${data.title}`);
      toast.success('Job created successfully');
      return data;
    } catch (error: any) {
      console.error('Error creating job:', error);
      // Rollback optimistic update
      setJobs(prev => prev.filter(j => j.id !== tempJob.id));
      toast.error('Failed to create job');
      return null;
    }
  };

  const updateJob = async (id: string, updates: Partial<Omit<Job, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => {
    if (!user) {
      toast.error('Authentication required');
      return false;
    }

    // Optimistic update
    const optimisticJob = jobs.find(j => j.id === id);
    if (optimisticJob) {
      setJobs(prev => prev.map(j => 
        j.id === id ? { ...j, ...updates, updated_at: new Date().toISOString() } : j
      ));
    }

    try {
      console.log('Updating job:', id, updates);
      
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
      
      await logActivity('update', 'job', id, `Updated job: ${data.title}`);
      toast.success('Job updated successfully');
      return true;
    } catch (error: any) {
      console.error('Error updating job:', error);
      // Rollback optimistic update
      if (optimisticJob) {
        setJobs(prev => prev.map(j => j.id === id ? optimisticJob : j));
      }
      toast.error('Failed to update job');
      return false;
    }
  };

  const deleteJob = async (id: string) => {
    if (!user) {
      toast.error('Authentication required');
      return false;
    }

    // Optimistic update
    const jobToDelete = jobs.find(j => j.id === id);
    setJobs(prev => prev.filter(j => j.id !== id));

    try {
      console.log('Deleting job:', id);
      
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      
      await logActivity('delete', 'job', id, `Deleted job: ${jobToDelete?.title}`);
      toast.success('Job deleted successfully');
      return true;
    } catch (error: any) {
      console.error('Error deleting job:', error);
      // Rollback optimistic update
      if (jobToDelete) {
        setJobs(prev => [...prev, jobToDelete].sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        ));
      }
      toast.error('Failed to delete job');
      return false;
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [user]);

  return {
    jobs,
    loading,
    createJob,
    updateJob,
    deleteJob,
    fetchJobs
  };
};
