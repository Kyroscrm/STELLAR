
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ConversionMetrics {
  totalLeads: number;
  convertedLeads: number;
  conversionRate: number;
  totalEstimates: number;
  acceptedEstimates: number;
  estimateAcceptanceRate: number;
  totalInvoices: number;
  paidInvoices: number;
  paymentRate: number;
  totalPipelineValue: number;
  wonPipelineValue: number;
  averageLeadValue: number;
  averageConversionTime: number; // in days
}

export const useConversionMetrics = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<ConversionMetrics>({
    totalLeads: 0,
    convertedLeads: 0,
    conversionRate: 0,
    totalEstimates: 0,
    acceptedEstimates: 0,
    estimateAcceptanceRate: 0,
    totalInvoices: 0,
    paidInvoices: 0,
    paymentRate: 0,
    totalPipelineValue: 0,
    wonPipelineValue: 0,
    averageLeadValue: 0,
    averageConversionTime: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      if (!user) return;

      setLoading(true);
      try {
        // Fetch leads data
        const { data: leads } = await supabase
          .from('leads')
          .select('*')
          .eq('user_id', user.id);

        // Fetch estimates data
        const { data: estimates } = await supabase
          .from('estimates')
          .select('*')
          .eq('user_id', user.id);

        // Fetch invoices data
        const { data: invoices } = await supabase
          .from('invoices')
          .select('*')
          .eq('user_id', user.id);

        if (leads && estimates && invoices) {
          const totalLeads = leads.length;
          const convertedLeads = leads.filter(l => l.status === 'won').length;
          const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;

          const totalEstimates = estimates.length;
          const acceptedEstimates = estimates.filter(e => e.status === 'accepted').length;
          const estimateAcceptanceRate = totalEstimates > 0 ? (acceptedEstimates / totalEstimates) * 100 : 0;

          const totalInvoices = invoices.length;
          const paidInvoices = invoices.filter(i => i.status === 'paid').length;
          const paymentRate = totalInvoices > 0 ? (paidInvoices / totalInvoices) * 100 : 0;

          const totalPipelineValue = leads.reduce((sum, lead) => sum + (lead.estimated_value || 0), 0);
          const wonPipelineValue = leads
            .filter(l => l.status === 'won')
            .reduce((sum, lead) => sum + (lead.estimated_value || 0), 0);

          const averageLeadValue = totalLeads > 0 ? totalPipelineValue / totalLeads : 0;

          // Calculate average conversion time
          const convertedLeadsWithDates = leads.filter(l => 
            l.status === 'won' && l.created_at && l.updated_at
          );
          const averageConversionTime = convertedLeadsWithDates.length > 0 
            ? convertedLeadsWithDates.reduce((sum, lead) => {
                const created = new Date(lead.created_at!);
                const updated = new Date(lead.updated_at!);
                return sum + (updated.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
              }, 0) / convertedLeadsWithDates.length
            : 0;

          setMetrics({
            totalLeads,
            convertedLeads,
            conversionRate,
            totalEstimates,
            acceptedEstimates,
            estimateAcceptanceRate,
            totalInvoices,
            paidInvoices,
            paymentRate,
            totalPipelineValue,
            wonPipelineValue,
            averageLeadValue,
            averageConversionTime
          });
        }
      } catch (error) {
        console.error('Error fetching conversion metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [user]);

  return { metrics, loading };
};
