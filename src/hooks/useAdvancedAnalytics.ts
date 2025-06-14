
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface AdvancedAnalytics {
  // Revenue Metrics
  totalRevenue: number;
  monthlyRevenue: number;
  quarterlyRevenue: number;
  revenueGrowthRate: number;
  
  // Conversion Metrics
  leadToCustomerRate: number;
  estimateToInvoiceRate: number;
  invoiceToPaymentRate: number;
  
  // Pipeline Metrics
  totalPipelineValue: number;
  wonPipelineValue: number;
  activePipelineValue: number;
  pipelineVelocity: number; // days to close
  
  // Forecasting
  projectedMonthlyRevenue: number;
  projectedQuarterlyRevenue: number;
  
  // Time-based data for charts
  monthlyRevenueData: Array<{ month: string; revenue: number; }>;
  quarterlyRevenueData: Array<{ quarter: string; revenue: number; }>;
}

export const useAdvancedAnalytics = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AdvancedAnalytics>({
    totalRevenue: 0,
    monthlyRevenue: 0,
    quarterlyRevenue: 0,
    revenueGrowthRate: 0,
    leadToCustomerRate: 0,
    estimateToInvoiceRate: 0,
    invoiceToPaymentRate: 0,
    totalPipelineValue: 0,
    wonPipelineValue: 0,
    activePipelineValue: 0,
    pipelineVelocity: 0,
    projectedMonthlyRevenue: 0,
    projectedQuarterlyRevenue: 0,
    monthlyRevenueData: [],
    quarterlyRevenueData: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdvancedAnalytics = async () => {
      if (!user) return;

      setLoading(true);
      try {
        // Fetch all necessary data
        const [
          { data: leads },
          { data: customers },
          { data: estimates },
          { data: invoices },
          { data: payments }
        ] = await Promise.all([
          supabase.from('leads').select('*').eq('user_id', user.id),
          supabase.from('customers').select('*').eq('user_id', user.id),
          supabase.from('estimates').select('*').eq('user_id', user.id),
          supabase.from('invoices').select('*').eq('user_id', user.id),
          supabase.from('payments').select('*').eq('user_id', user.id)
        ]);

        if (leads && customers && estimates && invoices && payments) {
          const now = new Date();
          const currentMonth = now.getMonth();
          const currentYear = now.getFullYear();

          // Revenue calculations
          const paidInvoices = invoices.filter(i => i.status === 'paid');
          const totalRevenue = paidInvoices.reduce((sum, invoice) => sum + (invoice.total_amount || 0), 0);
          
          const monthlyRevenue = paidInvoices
            .filter(i => {
              const invoiceDate = new Date(i.created_at || '');
              return invoiceDate.getMonth() === currentMonth && invoiceDate.getFullYear() === currentYear;
            })
            .reduce((sum, invoice) => sum + (invoice.total_amount || 0), 0);

          const quarterStart = Math.floor(currentMonth / 3) * 3;
          const quarterlyRevenue = paidInvoices
            .filter(i => {
              const invoiceDate = new Date(i.created_at || '');
              const month = invoiceDate.getMonth();
              return month >= quarterStart && month < quarterStart + 3 && invoiceDate.getFullYear() === currentYear;
            })
            .reduce((sum, invoice) => sum + (invoice.total_amount || 0), 0);

          // Calculate previous month revenue for growth rate
          const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
          const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;
          const previousMonthRevenue = paidInvoices
            .filter(i => {
              const invoiceDate = new Date(i.created_at || '');
              return invoiceDate.getMonth() === previousMonth && invoiceDate.getFullYear() === previousYear;
            })
            .reduce((sum, invoice) => sum + (invoice.total_amount || 0), 0);

          const revenueGrowthRate = previousMonthRevenue > 0 
            ? ((monthlyRevenue - previousMonthRevenue) / previousMonthRevenue) * 100 
            : 0;

          // Conversion rates
          const leadToCustomerRate = leads.length > 0 
            ? (customers.length / leads.length) * 100 
            : 0;

          const approvedEstimates = estimates.filter(e => e.status === 'approved');
          const estimateToInvoiceRate = estimates.length > 0 
            ? (invoices.length / estimates.length) * 100 
            : 0;

          const invoiceToPaymentRate = invoices.length > 0 
            ? (paidInvoices.length / invoices.length) * 100 
            : 0;

          // Pipeline metrics
          const totalPipelineValue = leads.reduce((sum, lead) => sum + (lead.estimated_value || 0), 0);
          const wonPipelineValue = leads
            .filter(l => l.status === 'won')
            .reduce((sum, lead) => sum + (lead.estimated_value || 0), 0);
          const activePipelineValue = leads
            .filter(l => ['new', 'contacted', 'qualified'].includes(l.status || ''))
            .reduce((sum, lead) => sum + (lead.estimated_value || 0), 0);

          // Calculate pipeline velocity (average days to close won leads)
          const wonLeads = leads.filter(l => l.status === 'won' && l.created_at && l.updated_at);
          const pipelineVelocity = wonLeads.length > 0
            ? wonLeads.reduce((sum, lead) => {
                const created = new Date(lead.created_at!);
                const closed = new Date(lead.updated_at!);
                return sum + (closed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
              }, 0) / wonLeads.length
            : 0;

          // Monthly revenue data for charts (last 12 months)
          const monthlyRevenueData = [];
          for (let i = 11; i >= 0; i--) {
            const targetDate = new Date(currentYear, currentMonth - i, 1);
            const monthRevenue = paidInvoices
              .filter(invoice => {
                const invoiceDate = new Date(invoice.created_at || '');
                return invoiceDate.getMonth() === targetDate.getMonth() && 
                       invoiceDate.getFullYear() === targetDate.getFullYear();
              })
              .reduce((sum, invoice) => sum + (invoice.total_amount || 0), 0);
            
            monthlyRevenueData.push({
              month: targetDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
              revenue: monthRevenue
            });
          }

          // Quarterly revenue data (last 4 quarters)
          const quarterlyRevenueData = [];
          for (let i = 3; i >= 0; i--) {
            const targetQuarter = Math.floor(currentMonth / 3) - i;
            const targetYear = targetQuarter < 0 ? currentYear - 1 : currentYear;
            const adjustedQuarter = targetQuarter < 0 ? targetQuarter + 4 : targetQuarter;
            
            const quarterRevenue = paidInvoices
              .filter(invoice => {
                const invoiceDate = new Date(invoice.created_at || '');
                const invoiceQuarter = Math.floor(invoiceDate.getMonth() / 3);
                return invoiceQuarter === adjustedQuarter && invoiceDate.getFullYear() === targetYear;
              })
              .reduce((sum, invoice) => sum + (invoice.total_amount || 0), 0);
            
            quarterlyRevenueData.push({
              quarter: `Q${adjustedQuarter + 1} ${targetYear}`,
              revenue: quarterRevenue
            });
          }

          // Simple forecasting based on growth trends
          const projectedMonthlyRevenue = monthlyRevenue * (1 + (revenueGrowthRate / 100));
          const projectedQuarterlyRevenue = quarterlyRevenue * 1.1; // Simple 10% growth assumption

          setAnalytics({
            totalRevenue,
            monthlyRevenue,
            quarterlyRevenue,
            revenueGrowthRate,
            leadToCustomerRate,
            estimateToInvoiceRate,
            invoiceToPaymentRate,
            totalPipelineValue,
            wonPipelineValue,
            activePipelineValue,
            pipelineVelocity,
            projectedMonthlyRevenue,
            projectedQuarterlyRevenue,
            monthlyRevenueData,
            quarterlyRevenueData
          });
        }
      } catch (error) {
        console.error('Error fetching advanced analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdvancedAnalytics();
  }, [user]);

  return { analytics, loading };
};
