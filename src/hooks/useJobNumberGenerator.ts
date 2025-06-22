
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
      const { data, error } = await supabase.rpc('generate_document_number', {
        doc_type: 'estimate',
        user_uuid: user.id
      });

      if (error) throw error;
      return data || 'EST-001';
    } catch (error) {
      console.error('Error generating estimate number:', error);
      // Fallback to timestamp-based number only if RPC fails
      return `EST-${Date.now().toString().slice(-6)}`;
    } finally {
      setLoading(false);
    }
  };

  const generateInvoiceNumber = async (): Promise<string> => {
    if (!user) return 'INV-001';

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('generate_document_number', {
        doc_type: 'invoice',
        user_uuid: user.id
      });

      if (error) throw error;
      return data || 'INV-001';
    } catch (error) {
      console.error('Error generating invoice number:', error);
      // Fallback to timestamp-based number only if RPC fails
      return `INV-${Date.now().toString().slice(-6)}`;
    } finally {
      setLoading(false);
    }
  };

  const generateJobNumber = async (): Promise<string> => {
    if (!user) return 'JOB-001';

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('generate_document_number', {
        doc_type: 'job',
        user_uuid: user.id
      });

      if (error) throw error;
      return data || 'JOB-001';
    } catch (error) {
      console.error('Error generating job number:', error);
      // Fallback to timestamp-based number only if RPC fails
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
