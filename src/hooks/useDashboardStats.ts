
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface DashboardStats {
  totalJobs: number;
  totalRevenue: number;
  totalLeads: number;
  totalTasks: number;
  completedJobs: number;
  activeJobs: number;
  conversionRate: number;
  avgJobValue: number;
}

export const useDashboardStats = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalJobs: 0,
    totalRevenue: 0,
    totalLeads: 0,
    totalTasks: 0,
    completedJobs: 0,
    activeJobs: 0,
    conversionRate: 0,
    avgJobValue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;

      try {
        setLoading(true);

        // Fetch jobs with RLS (admin sees all, users see their own)
        const { data: jobs, error: jobsError } = await supabase
          .from('jobs')
          .select('status, budget, total_cost');

        if (jobsError) throw jobsError;

        // Fetch leads with RLS
        const { data: leads, error: leadsError } = await supabase
          .from('leads')
          .select('id, status');

        if (leadsError) throw leadsError;

        // Fetch tasks with RLS
        const { data: tasks, error: tasksError } = await supabase
          .from('tasks')
          .select('id, status');

        if (tasksError) throw tasksError;

        const totalJobs = jobs?.length || 0;
        const totalLeads = leads?.length || 0;
        const totalTasks = tasks?.length || 0;
        
        const completedJobs = jobs?.filter(job => job.status === 'completed').length || 0;
        const activeJobs = jobs?.filter(job => ['scheduled', 'in_progress'].includes(job.status || '')).length || 0;
        
        const totalRevenue = jobs?.reduce((sum, job) => sum + (job.total_cost || 0), 0) || 0;
        const avgJobValue = totalJobs > 0 ? totalRevenue / totalJobs : 0;
        const conversionRate = totalLeads > 0 ? (totalJobs / totalLeads) * 100 : 0;

        setStats({
          totalJobs,
          totalRevenue,
          totalLeads,
          totalTasks,
          completedJobs,
          activeJobs,
          conversionRate,
          avgJobValue,
        });

        console.log(`Fetched stats for ${isAdmin ? 'admin' : 'user'}:`, {
          totalJobs,
          totalLeads,
          totalTasks,
          totalRevenue
        });

      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch stats');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user, isAdmin]);

  return { stats, loading, error };
};
