
import { useState, useEffect, useCallback } from 'react';
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

interface CachedStats extends DashboardStats {
  cachedAt: number;
  expiresAt: number;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const CACHE_KEY = 'dashboard_stats_cache';

export const useOptimizedDashboardStats = () => {
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
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  // Check cache first
  const getCachedStats = useCallback((): CachedStats | null => {
    if (!user) return null;
    
    try {
      const cached = localStorage.getItem(`${CACHE_KEY}_${user.id}`);
      if (!cached) return null;
      
      const parsedCache: CachedStats = JSON.parse(cached);
      if (Date.now() > parsedCache.expiresAt) {
        localStorage.removeItem(`${CACHE_KEY}_${user.id}`);
        return null;
      }
      
      return parsedCache;
    } catch {
      return null;
    }
  }, [user]);

  // Cache stats
  const setCachedStats = useCallback((newStats: DashboardStats) => {
    if (!user) return;
    
    const cachedData: CachedStats = {
      ...newStats,
      cachedAt: Date.now(),
      expiresAt: Date.now() + CACHE_DURATION
    };
    
    try {
      localStorage.setItem(`${CACHE_KEY}_${user.id}`, JSON.stringify(cachedData));
    } catch (error) {
      console.warn('Failed to cache dashboard stats:', error);
    }
  }, [user]);

  // Optimized fetch with single query using CTEs
  const fetchStats = useCallback(async (useCache = true) => {
    if (!user) return;
    
    // Check cache first
    if (useCache) {
      const cached = getCachedStats();
      if (cached) {
        setStats(cached);
        return;
      }
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching optimized dashboard stats for user:', user.id);
      
      // Use a single optimized query with CTEs for better performance
      const { data, error } = await supabase.rpc('get_dashboard_stats_optimized', {
        p_user_id: user.id
      });

      if (error) {
        // Fallback to individual queries if RPC doesn't exist
        console.log('RPC not available, using optimized parallel queries');
        await fetchStatsParallel();
        return;
      }

      if (data && data.length > 0) {
        const statsData = data[0];
        const newStats: DashboardStats = {
          totalCustomers: statsData.total_customers || 0,
          totalLeads: statsData.total_leads || 0,
          totalJobs: statsData.total_jobs || 0,
          totalEstimates: statsData.total_estimates || 0,
          totalInvoices: statsData.total_invoices || 0,
          totalTasks: statsData.total_tasks || 0,
          pendingTasks: statsData.pending_tasks || 0,
          draftEstimates: statsData.draft_estimates || 0,
          paidInvoices: statsData.paid_invoices || 0,
          totalRevenue: statsData.total_revenue || 0
        };
        
        setStats(newStats);
        setCachedStats(newStats);
        console.log('Dashboard stats fetched successfully via RPC');
      }
    } catch (error: any) {
      console.error('Error fetching dashboard stats:', error);
      setError(error);
      // Fallback to parallel queries
      await fetchStatsParallel();
    } finally {
      setLoading(false);
    }
  }, [user, getCachedStats, setCachedStats]);

  // Fallback optimized parallel queries
  const fetchStatsParallel = useCallback(async () => {
    if (!user) return;

    try {
      // Use Promise.allSettled for better error handling
      const results = await Promise.allSettled([
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

      // Extract successful results
      const counts = results.slice(0, 9).map(result => 
        result.status === 'fulfilled' ? (result.value.count || 0) : 0
      );

      const revenueResult = results[9];
      const totalRevenue = revenueResult.status === 'fulfilled' 
        ? (revenueResult.value.data?.reduce((sum: number, invoice: any) => 
            sum + (Number(invoice.total_amount) || 0), 0) || 0)
        : 0;

      const newStats: DashboardStats = {
        totalCustomers: counts[0],
        totalLeads: counts[1],
        totalJobs: counts[2],
        totalEstimates: counts[3],
        totalInvoices: counts[4],
        totalTasks: counts[5],
        pendingTasks: counts[6],
        draftEstimates: counts[7],
        paidInvoices: counts[8],
        totalRevenue
      };

      setStats(newStats);
      setCachedStats(newStats);
      console.log('Dashboard stats fetched successfully via parallel queries');
    } catch (error: any) {
      console.error('Error in parallel stats fetch:', error);
      setError(error);
    }
  }, [user, setCachedStats]);

  // Force refresh without cache
  const refreshStats = useCallback(() => {
    if (user) {
      localStorage.removeItem(`${CACHE_KEY}_${user.id}`);
      fetchStats(false);
    }
  }, [user, fetchStats]);

  // Auto-refresh on user change
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Set up real-time subscriptions for automatic updates
  useEffect(() => {
    if (!user) return;

    const channels = [
      'customers', 'leads', 'jobs', 'estimates', 
      'invoices', 'tasks'
    ].map(table => {
      const channel = supabase
        .channel(`${table}_changes_${user.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table,
            filter: `user_id=eq.${user.id}`
          },
          () => {
            // Debounce updates to avoid excessive refreshes
            setTimeout(() => refreshStats(), 1000);
          }
        )
        .subscribe();

      return channel;
    });

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, [user, refreshStats]);

  return { 
    stats, 
    loading, 
    error,
    refetch: fetchStats, 
    refreshStats 
  };
};
