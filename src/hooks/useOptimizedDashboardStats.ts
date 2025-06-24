import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';
import { useErrorHandler } from './useErrorHandler';
import { toast } from 'sonner';

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

interface LeadConversionMetrics {
  totalLeads: number;
  convertedLeads: number;
  conversionRate: number;
  totalPipelineValue: number;
  wonPipelineValue: number;
  averageLeadValue: number;
}

interface EstimateMetrics {
  totalEstimates: number;
  approvedEstimates: number;
  approvalRate: number;
  totalEstimateValue: number;
  approvedEstimateValue: number;
  uniqueCustomers: number;
}

interface MonthlyRevenue {
  month: string;
  totalRevenue: number;
  invoiceCount: number;
  paidRevenue: number;
  paidInvoiceCount: number;
}

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
  const [leadMetrics, setLeadMetrics] = useState<LeadConversionMetrics>({
    totalLeads: 0,
    convertedLeads: 0,
    conversionRate: 0,
    totalPipelineValue: 0,
    wonPipelineValue: 0,
    averageLeadValue: 0
  });
  const [estimateMetrics, setEstimateMetrics] = useState<EstimateMetrics>({
    totalEstimates: 0,
    approvedEstimates: 0,
    approvalRate: 0,
    totalEstimateValue: 0,
    approvedEstimateValue: 0,
    uniqueCustomers: 0
  });
  const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyRevenue[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();
  const { handleError } = useErrorHandler();

  const refreshMaterializedView = async (viewName: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase.rpc('refresh_specific_materialized_view', {
        view_name: viewName
      });

      if (error) throw error;

      return data;
    } catch (error: unknown) {
      handleError(error as Error, {
        title: `Failed to refresh materialized view: ${viewName}`,
        showToast: false
      });
      return null;
    }
  };

  const fetchDashboardSummary = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('mv_dashboard_summary')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        // If no data found, try refreshing the view
        if (error.code === 'PGRST116') {
          await refreshMaterializedView('mv_dashboard_summary');
          // Try fetching again
          const retryResult = await supabase
            .from('mv_dashboard_summary')
            .select('*')
            .eq('user_id', user.id)
            .single();

          if (retryResult.error) throw retryResult.error;
          if (retryResult.data) {
            setStats({
              totalCustomers: retryResult.data.total_customers || 0,
              totalLeads: retryResult.data.total_leads || 0,
              totalJobs: retryResult.data.total_jobs || 0,
              totalEstimates: retryResult.data.total_estimates || 0,
              totalInvoices: retryResult.data.total_invoices || 0,
              totalTasks: retryResult.data.total_tasks || 0,
              pendingTasks: retryResult.data.pending_tasks || 0,
              draftEstimates: retryResult.data.draft_estimates || 0,
              paidInvoices: retryResult.data.paid_invoices || 0,
              totalRevenue: retryResult.data.total_revenue || 0
            });
          }
        } else {
          throw error;
        }
      } else if (data) {
        setStats({
          totalCustomers: data.total_customers || 0,
          totalLeads: data.total_leads || 0,
          totalJobs: data.total_jobs || 0,
          totalEstimates: data.total_estimates || 0,
          totalInvoices: data.total_invoices || 0,
          totalTasks: data.total_tasks || 0,
          pendingTasks: data.pending_tasks || 0,
          draftEstimates: data.draft_estimates || 0,
          paidInvoices: data.paid_invoices || 0,
          totalRevenue: data.total_revenue || 0
        });
      }
    } catch (error: unknown) {
      handleError(error as Error, {
        title: 'Failed to fetch dashboard summary',
        showToast: false
      });
    }
  };

  const fetchLeadConversionMetrics = async () => {
    if (!user) return;

    try {
      // Get the most recent month's data
      const { data, error } = await supabase
        .from('mv_lead_conversion_metrics')
        .select('*')
        .eq('user_id', user.id)
        .order('month', { ascending: false })
        .limit(1);

      if (error) {
        // If no data found, try refreshing the view
        if (error.code === 'PGRST116') {
          await refreshMaterializedView('mv_lead_conversion_metrics');
          // Try fetching again
          const retryResult = await supabase
            .from('mv_lead_conversion_metrics')
            .select('*')
            .eq('user_id', user.id)
            .order('month', { ascending: false })
            .limit(1);

          if (retryResult.error) throw retryResult.error;
          if (retryResult.data && retryResult.data.length > 0) {
            setLeadMetrics({
              totalLeads: retryResult.data[0].total_leads || 0,
              convertedLeads: retryResult.data[0].converted_leads || 0,
              conversionRate: retryResult.data[0].conversion_rate || 0,
              totalPipelineValue: retryResult.data[0].total_pipeline_value || 0,
              wonPipelineValue: retryResult.data[0].won_pipeline_value || 0,
              averageLeadValue: retryResult.data[0].average_lead_value || 0
            });
          }
        } else {
          throw error;
        }
      } else if (data && data.length > 0) {
        setLeadMetrics({
          totalLeads: data[0].total_leads || 0,
          convertedLeads: data[0].converted_leads || 0,
          conversionRate: data[0].conversion_rate || 0,
          totalPipelineValue: data[0].total_pipeline_value || 0,
          wonPipelineValue: data[0].won_pipeline_value || 0,
          averageLeadValue: data[0].average_lead_value || 0
        });
      }
    } catch (error: unknown) {
      handleError(error as Error, {
        title: 'Failed to fetch lead conversion metrics',
        showToast: false
      });
    }
  };

  const fetchEstimateMetrics = async () => {
    if (!user) return;

    try {
      // Get the most recent month's data
      const { data, error } = await supabase
        .from('mv_estimate_metrics')
        .select('*')
        .eq('user_id', user.id)
        .order('month', { ascending: false })
        .limit(1);

      if (error) {
        // If no data found, try refreshing the view
        if (error.code === 'PGRST116') {
          await refreshMaterializedView('mv_estimate_metrics');
          // Try fetching again
          const retryResult = await supabase
            .from('mv_estimate_metrics')
            .select('*')
            .eq('user_id', user.id)
            .order('month', { ascending: false })
            .limit(1);

          if (retryResult.error) throw retryResult.error;
          if (retryResult.data && retryResult.data.length > 0) {
            setEstimateMetrics({
              totalEstimates: retryResult.data[0].total_estimates || 0,
              approvedEstimates: retryResult.data[0].approved_estimates || 0,
              approvalRate: retryResult.data[0].approval_rate || 0,
              totalEstimateValue: retryResult.data[0].total_estimate_value || 0,
              approvedEstimateValue: retryResult.data[0].approved_estimate_value || 0,
              uniqueCustomers: retryResult.data[0].unique_customers || 0
            });
          }
        } else {
          throw error;
        }
      } else if (data && data.length > 0) {
        setEstimateMetrics({
          totalEstimates: data[0].total_estimates || 0,
          approvedEstimates: data[0].approved_estimates || 0,
          approvalRate: data[0].approval_rate || 0,
          totalEstimateValue: data[0].total_estimate_value || 0,
          approvedEstimateValue: data[0].approved_estimate_value || 0,
          uniqueCustomers: data[0].unique_customers || 0
        });
      }
    } catch (error: unknown) {
      handleError(error as Error, {
        title: 'Failed to fetch estimate metrics',
        showToast: false
      });
    }
  };

  const fetchMonthlyRevenue = async () => {
    if (!user) return;

    try {
      // Get the last 12 months of revenue data
      const { data, error } = await supabase
        .from('mv_monthly_revenue')
        .select('*')
        .eq('user_id', user.id)
        .order('month', { ascending: false })
        .limit(12);

      if (error) {
        // If no data found, try refreshing the view
        if (error.code === 'PGRST116') {
          await refreshMaterializedView('mv_monthly_revenue');
          // Try fetching again
          const retryResult = await supabase
            .from('mv_monthly_revenue')
            .select('*')
            .eq('user_id', user.id)
            .order('month', { ascending: false })
            .limit(12);

          if (retryResult.error) throw retryResult.error;
          if (retryResult.data) {
            setMonthlyRevenue(retryResult.data.map(item => ({
              month: item.month,
              totalRevenue: item.total_revenue || 0,
              invoiceCount: item.invoice_count || 0,
              paidRevenue: item.paid_revenue || 0,
              paidInvoiceCount: item.paid_invoice_count || 0
            })));
          }
        } else {
          throw error;
        }
      } else if (data) {
        setMonthlyRevenue(data.map(item => ({
          month: item.month,
          totalRevenue: item.total_revenue || 0,
          invoiceCount: item.invoice_count || 0,
          paidRevenue: item.paid_revenue || 0,
          paidInvoiceCount: item.paid_invoice_count || 0
        })));
      }
    } catch (error: unknown) {
      handleError(error as Error, {
        title: 'Failed to fetch monthly revenue',
        showToast: false
      });
    }
  };

  const fetchStats = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      // Fetch all stats in parallel
      await Promise.all([
        fetchDashboardSummary(),
        fetchLeadConversionMetrics(),
        fetchEstimateMetrics(),
        fetchMonthlyRevenue()
      ]);
    } catch (error: unknown) {
      setError(error as Error);
      handleError(error as Error, {
        title: 'Failed to fetch dashboard stats',
        showToast: true
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshAllStats = async () => {
    if (!user) return;

    setLoading(true);
    toast.loading('Refreshing dashboard stats...');

    try {
      // Refresh all materialized views
      const { data, error } = await supabase.rpc('scheduled_refresh_materialized_views');

      if (error) throw error;

      // Fetch the updated stats
      await fetchStats();

      toast.success('Dashboard stats refreshed successfully');
    } catch (error: unknown) {
      handleError(error as Error, {
        title: 'Failed to refresh dashboard stats'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [user]);

  return {
    stats,
    leadMetrics,
    estimateMetrics,
    monthlyRevenue,
    loading,
    error,
    refetch: fetchStats,
    refreshStats: refreshAllStats
  };
};
