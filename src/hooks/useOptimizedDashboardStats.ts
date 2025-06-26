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

  const fetchDashboardSummary = async () => {
    if (!user) return;

    try {
      // Fetch basic counts from actual tables
      const [customersResult, leadsResult, jobsResult, estimatesResult, invoicesResult, tasksResult] = await Promise.all([
        supabase.from('customers').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('leads').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('jobs').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('estimates').select('id, total_amount, status', { count: 'exact' }).eq('user_id', user.id),
        supabase.from('invoices').select('id, total_amount, status', { count: 'exact' }).eq('user_id', user.id),
        supabase.from('tasks').select('id, status', { count: 'exact' }).eq('user_id', user.id)
      ]);

      const estimates = estimatesResult.data || [];
      const invoices = invoicesResult.data || [];
      const tasks = tasksResult.data || [];

      const draftEstimates = estimates.filter(e => e.status === 'draft').length;
      const paidInvoices = invoices.filter(i => i.status === 'paid').length;
      const pendingTasks = tasks.filter(t => t.status === 'pending' || t.status === 'in_progress').length;
      const totalRevenue = invoices
        .filter(i => i.status === 'paid')
        .reduce((sum, i) => sum + (i.total_amount || 0), 0);

      setStats({
        totalCustomers: customersResult.count || 0,
        totalLeads: leadsResult.count || 0,
        totalJobs: jobsResult.count || 0,
        totalEstimates: estimatesResult.count || 0,
        totalInvoices: invoicesResult.count || 0,
        totalTasks: tasksResult.count || 0,
        pendingTasks,
        draftEstimates,
        paidInvoices,
        totalRevenue
      });
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
      const { data: leads, error } = await supabase
        .from('leads')
        .select('id, status, estimated_value')
        .eq('user_id', user.id);

      if (error) throw error;

      const totalLeads = leads?.length || 0;
      const convertedLeads = leads?.filter(l => l.status === 'won').length || 0;
      const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;
      const totalPipelineValue = leads?.reduce((sum, l) => sum + (l.estimated_value || 0), 0) || 0;
      const wonPipelineValue = leads?.filter(l => l.status === 'won').reduce((sum, l) => sum + (l.estimated_value || 0), 0) || 0;
      const averageLeadValue = totalLeads > 0 ? totalPipelineValue / totalLeads : 0;

      setLeadMetrics({
        totalLeads,
        convertedLeads,
        conversionRate,
        totalPipelineValue,
        wonPipelineValue,
        averageLeadValue
      });
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
      const { data: estimates, error } = await supabase
        .from('estimates')
        .select('id, status, total_amount, customer_id')
        .eq('user_id', user.id);

      if (error) throw error;

      const totalEstimates = estimates?.length || 0;
      const approvedEstimates = estimates?.filter(e => e.status === 'approved').length || 0;
      const approvalRate = totalEstimates > 0 ? (approvedEstimates / totalEstimates) * 100 : 0;
      const totalEstimateValue = estimates?.reduce((sum, e) => sum + (e.total_amount || 0), 0) || 0;
      const approvedEstimateValue = estimates?.filter(e => e.status === 'approved').reduce((sum, e) => sum + (e.total_amount || 0), 0) || 0;
      const uniqueCustomers = new Set(estimates?.map(e => e.customer_id).filter(Boolean)).size;

      setEstimateMetrics({
        totalEstimates,
        approvedEstimates,
        approvalRate,
        totalEstimateValue,
        approvedEstimateValue,
        uniqueCustomers
      });
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
      const { data: invoices, error } = await supabase
        .from('invoices')
        .select('id, total_amount, status, created_at')
        .eq('user_id', user.id)
        .gte('created_at', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString());

      if (error) throw error;

      // Group by month
      const monthlyData: Record<string, MonthlyRevenue> = {};

      invoices?.forEach(invoice => {
        if (!invoice.created_at) return;

        const date = new Date(invoice.created_at);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = {
            month: monthKey,
            totalRevenue: 0,
            invoiceCount: 0,
            paidRevenue: 0,
            paidInvoiceCount: 0
          };
        }

        monthlyData[monthKey].totalRevenue += invoice.total_amount || 0;
        monthlyData[monthKey].invoiceCount += 1;

        if (invoice.status === 'paid') {
          monthlyData[monthKey].paidRevenue += invoice.total_amount || 0;
          monthlyData[monthKey].paidInvoiceCount += 1;
        }
      });

      const sortedMonthlyRevenue = Object.values(monthlyData)
        .sort((a, b) => b.month.localeCompare(a.month))
        .slice(0, 12);

      setMonthlyRevenue(sortedMonthlyRevenue);
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
