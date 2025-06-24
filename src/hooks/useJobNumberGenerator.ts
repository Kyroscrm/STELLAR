import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useState } from 'react';

export const useJobNumberGenerator = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const generateEstimateNumber = async (): Promise<string> => {
    if (!user) return 'EST-001';

    setLoading(true);
    try {
      // Try to use the RPC function, but fall back if it doesn't exist
      const { data, error } = await supabase.rpc('generate_document_number' as const, {
        doc_type: 'estimate',
        user_uuid: user.id
      });

      if (error) {
        // RPC function not available, using fallback
        return `EST-${Date.now().toString().slice(-6)}`;
      }

      return (data as string) || 'EST-001';
    } catch (error: unknown) {
      // Error handled - fallback to timestamp-based number
      return `EST-${Date.now().toString().slice(-6)}`;
    } finally {
      setLoading(false);
    }
  };

  const generateInvoiceNumber = async (): Promise<string> => {
    if (!user) return 'INV-001';

    setLoading(true);
    try {
      // Try to use the RPC function, but fall back if it doesn't exist
      const { data, error } = await supabase.rpc('generate_document_number' as const, {
        doc_type: 'invoice',
        user_uuid: user.id
      });

      if (error) {
        // RPC function not available, using fallback
        return `INV-${Date.now().toString().slice(-6)}`;
      }

      return (data as string) || 'INV-001';
    } catch (error: unknown) {
      // Error handled - fallback to timestamp-based number
      return `INV-${Date.now().toString().slice(-6)}`;
    } finally {
      setLoading(false);
    }
  };

  const generateJobNumber = async (): Promise<string> => {
    if (!user) return 'JOB-001';

    setLoading(true);
    try {
      // Try to use the RPC function, but fall back if it doesn't exist
      const { data, error } = await supabase.rpc('generate_document_number' as const, {
        doc_type: 'job',
        user_uuid: user.id
      });

      if (error) {
        // RPC function not available, using fallback
        return `JOB-${Date.now().toString().slice(-6)}`;
      }

      return (data as string) || 'JOB-001';
    } catch (error: unknown) {
      // Error handled - fallback to timestamp-based number
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
