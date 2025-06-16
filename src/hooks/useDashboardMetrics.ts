
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface DashboardMetric {
  id: string;
  user_id: string;
  metric_type: string;
  value: number;
  metadata: any;
  period: 'today' | 'week' | 'month' | 'quarter' | 'year';
  calculated_at: string;
  expires_at: string;
}

// Type guard function
const isValidPeriod = (period: string): period is 'today' | 'week' | 'month' | 'quarter' | 'year' => {
  return ['today', 'week', 'month', 'quarter', 'year'].includes(period);
};

// Safe conversion function
const convertToDashboardMetric = (dbData: any): DashboardMetric => ({
  ...dbData,
  period: isValidPeriod(dbData.period) ? dbData.period : 'month'
});

export const useDashboardMetrics = () => {
  const { user, session } = useAuth();
  const [metrics, setMetrics] = useState<DashboardMetric[]>([]);
  const [loading, setLoading] = useState(false);

  const validateUserAndSession = () => {
    if (!user || !session) {
      toast.error('Authentication required. Please log in again.');
      return false;
    }
    return true;
  };

  const fetchMetrics = async (period: string = 'month') => {
    if (!validateUserAndSession()) return;

    setLoading(true);
    try {
      console.log('Fetching dashboard metrics for user:', user.id, 'period:', period);
      
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
      } else {
        console.log(`Successfully fetched ${convertedMetrics.length} cached metrics`);
      }
    } catch (error: any) {
      console.error('Error fetching dashboard metrics:', error);
      toast.error('Failed to fetch dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  const calculateMetrics = async (period: string) => {
    if (!validateUserAndSession()) return;

    try {
      console.log('Calculating metrics for period:', period);
      
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

      const validPeriod = isValidPeriod(period) ? period : 'month';

      const metricsToCache = [
        {
          user_id: user.id,
          metric_type: 'total_revenue',
          value: totalRevenue,
          metadata: { currency: 'USD' },
          period: validPeriod,
          expires_at: expiresAt.toISOString()
        },
        {
          user_id: user.id,
          metric_type: 'leads_count',
          value: leadsCount || 0,
          metadata: {},
          period: validPeriod,
          expires_at: expiresAt.toISOString()
        },
        {
          user_id: user.id,
          metric_type: 'customers_count',
          value: customersCount || 0,
          metadata: {},
          period: validPeriod,
          expires_at: expiresAt.toISOString()
        },
        {
          user_id: user.id,
          metric_type: 'jobs_count',
          value: jobsCount || 0,
          metadata: {},
          period: validPeriod,
          expires_at: expiresAt.toISOString()
        }
      ];

      // Insert or update cached metrics
      for (const metric of metricsToCache) {
        const { error } = await supabase
          .from('dashboard_metrics_cache')
          .upsert(metric, {
            onConflict: 'user_id,metric_type,period'
          });

        if (error) {
          console.error('Error caching metric:', error);
        }
      }

      // Fetch the updated metrics
      await fetchMetrics(validPeriod);
      console.log('Metrics calculated and cached successfully');
    } catch (error: any) {
      console.error('Error calculating metrics:', error);
      toast.error('Failed to calculate metrics');
    }
  };

  const getMetricValue = (metricType: string) => {
    const metric = metrics.find(m => m.metric_type === metricType);
    return metric?.value || 0;
  };

  const refreshMetrics = async (period: string = 'month') => {
    await calculateMetrics(period);
  };

  useEffect(() => {
    fetchMetrics();
  }, [user, session]);

  return {
    metrics,
    loading,
    getMetricValue,
    refreshMetrics,
    fetchMetrics
  };
};
