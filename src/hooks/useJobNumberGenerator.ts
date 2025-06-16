
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useJobNumberGenerator = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const generateJobNumber = async (): Promise<string> => {
    setLoading(true);
    try {
      const { count } = await supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id);

      const nextNumber = (count || 0) + 1;
      return `JOB-${String(nextNumber).padStart(4, '0')}`;
    } catch (error) {
      console.error('Error generating job number:', error);
      return `JOB-${String(Date.now()).slice(-4)}`;
    } finally {
      setLoading(false);
    }
  };

  const generateEstimateNumber = async (): Promise<string> => {
    setLoading(true);
    try {
      const { count } = await supabase
        .from('estimates')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id);

      const nextNumber = (count || 0) + 1;
      return `EST-${String(nextNumber).padStart(4, '0')}`;
    } catch (error) {
      console.error('Error generating estimate number:', error);
      return `EST-${String(Date.now()).slice(-4)}`;
    } finally {
      setLoading(false);
    }
  };

  const generateInvoiceNumber = async (): Promise<string> => {
    setLoading(true);
    try {
      const { count } = await supabase
        .from('invoices')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id);

      const nextNumber = (count || 0) + 1;
      return `INV-${String(nextNumber).padStart(4, '0')}`;
    } catch (error) {
      console.error('Error generating invoice number:', error);
      return `INV-${String(Date.now()).slice(-4)}`;
    } finally {
      setLoading(false);
    }
  };

  return {
    generateJobNumber,
    generateEstimateNumber,
    generateInvoiceNumber,
    loading
  };
};
