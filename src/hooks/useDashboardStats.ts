
import { useState, useEffect, useRef, useCallback } from 'react';
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

// Global map to track active subscriptions per user to prevent duplicates
const activeSubscriptions = new Map<string, any>();

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
  const instanceId = useRef<string>(`instance-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
  const hasSubscribed = useRef(false);

  const fetchStats = useCallback(async () => {
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
  }, [user]);

  useEffect(() => {
    if (!user?.id || hasSubscribed.current) return;

    // Check if there's already an active subscription for this user
    const userKey = user.id;
    
    if (activeSubscriptions.has(userKey)) {
      console.log('Dashboard stats subscription already exists for user, reusing...');
      // Just fetch initial data without creating new subscription
      fetchStats();
      return;
    }

    console.log('Creating new dashboard stats subscription for user:', user.id, 'instance:', instanceId.current);
    hasSubscribed.current = true;

    // Create a unique channel name that won't conflict
    const channelName = `dashboard-stats-${user.id}-${instanceId.current}`;
    console.log('Creating dashboard stats channel:', channelName);
    
    const channel = supabase.channel(channelName);
    
    // Add all table listeners to the single channel
    const tables = ['customers', 'leads', 'jobs', 'estimates', 'invoices', 'tasks'];
    
    tables.forEach(table => {
      channel.on('postgres_changes', 
        { event: '*', schema: 'public', table, filter: `user_id=eq.${user.id}` }, 
        () => {
          console.log(`${table} changed, refreshing dashboard stats`);
          fetchStats();
        }
      );
    });

    // Subscribe to the channel
    channel.subscribe((status) => {
      console.log('Dashboard stats subscription status:', status, 'for instance:', instanceId.current);
    });

    // Store the subscription in the global map
    activeSubscriptions.set(userKey, channel);
    
    // Initial fetch
    fetchStats();

    return () => {
      console.log('Cleaning up dashboard stats subscription for instance:', instanceId.current);
      if (activeSubscriptions.get(userKey) === channel) {
        supabase.removeChannel(channel);
        activeSubscriptions.delete(userKey);
        console.log('Removed dashboard stats subscription from global map');
      }
      hasSubscribed.current = false;
    };
  }, [user?.id]);

  return { stats, loading, refetch: fetchStats };
};
