
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useJobNumberGenerator = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const generateEstimateNumber = async (): Promise<string> => {
    if (!user) return 'EST-001';

    setLoading(true);
    try {
      // Get the count of existing estimates for this user
      const { count, error } = await supabase
        .from('estimates')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (error) throw error;

      const nextNumber = (count || 0) + 1;
      return `EST-${nextNumber.toString().padStart(3, '0')}`;
    } catch (error) {
      console.error('Error generating estimate number:', error);
      // Fallback to timestamp-based number
      return `EST-${Date.now().toString().slice(-6)}`;
    } finally {
      setLoading(false);
    }
  };

  const generateInvoiceNumber = async (): Promise<string> => {
    if (!user) return 'INV-001';

    setLoading(true);
    try {
      // Get the count of existing invoices for this user
      const { count, error } = await supabase
        .from('invoices')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (error) throw error;

      const nextNumber = (count || 0) + 1;
      return `INV-${nextNumber.toString().padStart(3, '0')}`;
    } catch (error) {
      console.error('Error generating invoice number:', error);
      // Fallback to timestamp-based number
      return `INV-${Date.now().toString().slice(-6)}`;
    } finally {
      setLoading(false);
    }
  };

  const generateJobNumber = async (): Promise<string> => {
    if (!user) return 'JOB-001';

    setLoading(true);
    try {
      // Get the count of existing jobs for this user
      const { count, error } = await supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (error) throw error;

      const nextNumber = (count || 0) + 1;
      return `JOB-${nextNumber.toString().padStart(3, '0')}`;
    } catch (error) {
      console.error('Error generating job number:', error);
      // Fallback to timestamp-based number
      return `JOB-${Date.now().toString().slice(-6)}`;
    } finally {
      setLoading(false);
    }
  };

  return {
    generateEstimateNumber,
    generateInvoiceNumber,
    generateJobNumber,
    loading
  };
};
