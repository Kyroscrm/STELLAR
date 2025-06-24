import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useErrorHandler } from './useErrorHandler';
import { ApiError } from '@/types/app-types';

export type DashboardMetric = Tables<'dashboard_metrics_cache'>;
type DashboardMetricInsert = TablesInsert<'dashboard_metrics_cache'>;
type Period = 'today' | 'week' | 'month' | 'quarter' | 'year';

// Type guard function
const isValidPeriod = (period: string): period is Period => {
  return ['today', 'week', 'month', 'quarter', 'year'].includes(period);
};

// Safe conversion function
const convertToDashboardMetric = (dbData: unknown): DashboardMetric => {
  const data = dbData as Partial<DashboardMetric>;
  return {
    ...data,
    period: isValidPeriod(data.period as string) ? data.period as Period : 'month'
  } as DashboardMetric;
};

interface UseDashboardMetricsReturn {
  metrics: DashboardMetric[];
  loading: boolean;
  error: Error | null;
  getMetricValue: (metricType: string) => number;
  refreshMetrics: (period?: Period) => Promise<void>;
  fetchMetrics: (period?: Period) => Promise<void>;
}

const isSupabaseError = (error: unknown): error is ApiError => {
  return typeof error === 'object' && error !== null && 'error' in error && typeof (error as ApiError).error === 'object';
};

export const useDashboardMetrics = (): UseDashboardMetricsReturn => {
  const { user, session } = useAuth();
  const [metrics, setMetrics] = useState<DashboardMetric[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { handleError } = useErrorHandler();

  const validateUserAndSession = () => {
    if (!user || !session) {
      const errorMsg = 'Authentication required. Please log in again.';
      setError(new Error(errorMsg));
      toast.error(errorMsg);
      return false;
    }
    return true;
  };

  const fetchMetrics = async (period: Period = 'month') => {
    if (!validateUserAndSession()) return;

    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('dashboard_metrics_cache')
        .select('*')
        .eq('user_id', user.id)
        .eq('period', period)
        .gt('expires_at', new Date().toISOString());

      if (error) throw error;

      const convertedMetrics = data ? data.map(convertToDashboardMetric) : [];
      setMetrics(convertedMetrics);

      // If no cached metrics or they're expired, calculate fresh ones
      if (!data || data.length === 0) {
        await calculateMetrics(period);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error);
        handleError(error, { title: 'Failed to fetch dashboard metrics' });
      } else if (isSupabaseError(error)) {
        const supabaseError = new Error(error.error.message);
        setError(supabaseError);
        handleError(supabaseError, { title: 'Failed to fetch dashboard metrics' });
      } else {
        const fallbackError = new Error('An unexpected error occurred while fetching dashboard metrics');
        setError(fallbackError);
        handleError(fallbackError, { title: 'Failed to fetch dashboard metrics' });
      }
      setMetrics([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateMetrics = async (period: Period) => {
    if (!validateUserAndSession()) return;

    setLoading(true);
    setError(null);
    try {
      // Calculate various metrics based on period
      const endDate = new Date();
      const startDate = new Date();

      switch (period) {
        case 'today':
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(startDate.getMonth() - 1);
          break;
        case 'quarter':
          startDate.setMonth(startDate.getMonth() - 3);
          break;
        case 'year':
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
      }

      // Calculate total revenue from invoices
      const { data: invoiceData, error: invoiceError } = await supabase
        .from('invoices')
        .select('total_amount')
        .eq('user_id', user.id)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (invoiceError) throw invoiceError;

      const totalRevenue = invoiceData?.reduce((sum, invoice) => sum + (invoice.total_amount || 0), 0) || 0;

      // Calculate other metrics
      const [
        { count: leadsCount, error: leadsError },
        { count: customersCount, error: customersError },
        { count: jobsCount, error: jobsError }
      ] = await Promise.all([
        supabase
          .from('leads')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString()),
        supabase
          .from('customers')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString()),
        supabase
          .from('jobs')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString())
      ]);

      if (leadsError) throw leadsError;
      if (customersError) throw customersError;
      if (jobsError) throw jobsError;

      // Cache the calculated metrics
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1); // Cache for 1 hour

      const metricsToCache: DashboardMetricInsert[] = [
        {
          user_id: user.id,
          metric_type: 'total_revenue',
          value: totalRevenue,
          metadata: { currency: 'USD' },
          period: period,
          expires_at: expiresAt.toISOString(),
          calculated_at: new Date().toISOString()
        },
        {
          user_id: user.id,
          metric_type: 'leads_count',
          value: leadsCount || 0,
          metadata: {},
          period: period,
          expires_at: expiresAt.toISOString(),
          calculated_at: new Date().toISOString()
        },
        {
          user_id: user.id,
          metric_type: 'customers_count',
          value: customersCount || 0,
          metadata: {},
          period: period,
          expires_at: expiresAt.toISOString(),
          calculated_at: new Date().toISOString()
        },
        {
          user_id: user.id,
          metric_type: 'jobs_count',
          value: jobsCount || 0,
          metadata: {},
          period: period,
          expires_at: expiresAt.toISOString(),
          calculated_at: new Date().toISOString()
        }
      ];

      // Insert or update cached metrics
      const errors = [];
      for (const metric of metricsToCache) {
        const { error } = await supabase
          .from('dashboard_metrics_cache')
          .upsert(metric, {
            onConflict: 'user_id,metric_type,period'
          });

        if (error) {
          errors.push(error);
        }
      }

      if (errors.length > 0) {
        // Log errors but continue - we'll still try to fetch metrics
        console.error('Some metrics failed to cache:', errors);
      }

      // Fetch the updated metrics
      await fetchMetrics(period);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error);
        handleError(error, { title: 'Failed to calculate metrics' });
      } else if (isSupabaseError(error)) {
        const supabaseError = new Error(error.error.message);
        setError(supabaseError);
        handleError(supabaseError, { title: 'Failed to calculate metrics' });
      } else {
        const fallbackError = new Error('An unexpected error occurred while calculating metrics');
        setError(fallbackError);
        handleError(fallbackError, { title: 'Failed to calculate metrics' });
      }
    } finally {
      setLoading(false);
    }
  };

  const getMetricValue = (metricType: string) => {
    const metric = metrics.find(m => m.metric_type === metricType);
    return metric?.value || 0;
  };

  const refreshMetrics = async (period: Period = 'month') => {
    await calculateMetrics(period);
  };

  useEffect(() => {
    if (user && session) {
      fetchMetrics();
    }
  }, [user, session]);

  return {
    metrics,
    loading,
    error,
    getMetricValue,
    refreshMetrics,
    fetchMetrics
  };
};
