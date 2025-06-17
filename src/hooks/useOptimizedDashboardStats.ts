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

  // Optimized fetch with parallel queries
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
      console.log('Dashboard stats fetched successfully via optimized parallel queries');
    } catch (error: any) {
      console.error('Error fetching dashboard stats:', error);
      setError(error);
    } finally {
      setLoading(false);
    }
  }, [user, getCachedStats, setCachedStats]);

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

  // Enhanced real-time subscriptions with intelligent debouncing
  useEffect(() => {
    if (!user) return;

    let refreshTimeout: NodeJS.Timeout;
    const debouncedRefresh = () => {
      clearTimeout(refreshTimeout);
      refreshTimeout = setTimeout(() => refreshStats(), 2000); // 2 second debounce
    };

    const channels = [
      'customers', 'leads', 'jobs', 'estimates', 
      'invoices', 'tasks'
    ].map((table, index) => {
      const channel = supabase
        .channel(`${table}_stats_${user.id}_${index}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table,
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log(`Real-time stats update from ${table}:`, payload.eventType);
            debouncedRefresh();
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log(`Stats subscription active for ${table}`);
          }
        });

      return channel;
    });

    return () => {
      clearTimeout(refreshTimeout);
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
