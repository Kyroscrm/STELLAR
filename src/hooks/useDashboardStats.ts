
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface DashboardStats {
  totalCustomers: number;
  totalLeads: number;
  totalJobs: number;
  totalEstimates: number;
  totalInvoices: number;
  totalTasks: number;
  pendingTasks: number;
  draftEstimates: number;
  paidInvoices: number;
  totalRevenue: number;
}

export const useDashboardStats = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalCustomers: 0,
    totalLeads: 0,
    totalJobs: 0,
    totalEstimates: 0,
    totalInvoices: 0,
    totalTasks: 0,
    pendingTasks: 0,
    draftEstimates: 0,
    paidInvoices: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchStats = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      console.log('Fetching dashboard stats for user:', user.id);
      
      const [
        { count: totalCustomers },
        { count: totalLeads },
        { count: totalJobs },
        { count: totalEstimates },
        { count: totalInvoices },
        { count: totalTasks },
        { count: pendingTasks },
        { count: draftEstimates },
        { count: paidInvoices },
        { data: revenueData }
      ] = await Promise.all([
        supabase.from('customers').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('leads').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('estimates').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('invoices').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'pending'),
        supabase.from('estimates').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'draft'),
        supabase.from('invoices').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'paid'),
        supabase.from('invoices').select('total_amount').eq('user_id', user.id).eq('status', 'paid')
      ]);

      const totalRevenue = revenueData?.reduce((sum, invoice) => sum + (Number(invoice.total_amount) || 0), 0) || 0;

      const newStats = {
        totalCustomers: totalCustomers || 0,
        totalLeads: totalLeads || 0,
        totalJobs: totalJobs || 0,
        totalEstimates: totalEstimates || 0,
        totalInvoices: totalInvoices || 0,
        totalTasks: totalTasks || 0,
        pendingTasks: pendingTasks || 0,
        draftEstimates: draftEstimates || 0,
        paidInvoices: paidInvoices || 0,
        totalRevenue
      };

      setStats(newStats);
      console.log('Dashboard stats updated:', newStats);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  // Set up real-time updates with unique channel names to prevent subscription conflicts
  useEffect(() => {
    if (!user) return;

    console.log('Setting up real-time subscriptions for dashboard stats');

    const channels = [
      supabase.channel(`dashboard-customers-${user.id}`).on('postgres_changes', 
        { event: '*', schema: 'public', table: 'customers', filter: `user_id=eq.${user.id}` }, 
        () => {
          console.log('Customers changed, refreshing stats');
          fetchStats();
        }
      ),
      supabase.channel(`dashboard-leads-${user.id}`).on('postgres_changes', 
        { event: '*', schema: 'public', table: 'leads', filter: `user_id=eq.${user.id}` }, 
        () => {
          console.log('Leads changed, refreshing stats');
          fetchStats();
        }
      ),
      supabase.channel(`dashboard-jobs-${user.id}`).on('postgres_changes', 
        { event: '*', schema: 'public', table: 'jobs', filter: `user_id=eq.${user.id}` }, 
        () => {
          console.log('Jobs changed, refreshing stats');
          fetchStats();
        }
      ),
      supabase.channel(`dashboard-estimates-${user.id}`).on('postgres_changes', 
        { event: '*', schema: 'public', table: 'estimates', filter: `user_id=eq.${user.id}` }, 
        () => {
          console.log('Estimates changed, refreshing stats');
          fetchStats();
        }
      ),
      supabase.channel(`dashboard-invoices-${user.id}`).on('postgres_changes', 
        { event: '*', schema: 'public', table: 'invoices', filter: `user_id=eq.${user.id}` }, 
        () => {
          console.log('Invoices changed, refreshing stats');
          fetchStats();
        }
      ),
      supabase.channel(`dashboard-tasks-${user.id}`).on('postgres_changes', 
        { event: '*', schema: 'public', table: 'tasks', filter: `user_id=eq.${user.id}` }, 
        () => {
          console.log('Tasks changed, refreshing stats');
          fetchStats();
        }
      )
    ];

    channels.forEach(channel => channel.subscribe());
    
    // Initial fetch
    fetchStats();

    return () => {
      console.log('Cleaning up dashboard stats subscriptions');
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, [user]);

  return { stats, loading, refetch: fetchStats };
};
