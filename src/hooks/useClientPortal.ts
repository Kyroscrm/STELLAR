
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ClientPortalData {
  customer: any;
  jobs: any[];
  estimates: any[];
  invoices: any[];
  documents: any[];
}

export const useClientPortalAuth = (token?: string) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [portalData, setPortalData] = useState<ClientPortalData | null>(null);

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        console.log('Validating client portal token');
        
        const { data, error } = await supabase
          .rpc('validate_client_portal_token', {
            p_token: token
          });

        if (error) throw error;

        if (data && data.length > 0 && data[0].is_valid) {
          setIsAuthenticated(true);
          await fetchPortalData(data[0].customer_id);
        } else {
          setError('Invalid or expired access token');
        }
      } catch (error: any) {
        console.error('Token validation error:', error);
        setError('Failed to validate access token');
      } finally {
        setIsLoading(false);
      }
    };

    validateToken();
  }, [token]);

  const fetchPortalData = async (customerId: string) => {
    try {
      console.log('Fetching portal data for customer:', customerId);
      
      // This would typically require special RLS policies for client portal access
      // For now, we'll implement a basic version
      const [customerRes, jobsRes, estimatesRes, invoicesRes] = await Promise.all([
        supabase.from('customers').select('*').eq('id', customerId).single(),
        supabase.from('jobs').select('*').eq('customer_id', customerId),
        supabase.from('estimates').select('*').eq('customer_id', customerId),
        supabase.from('invoices').select('*').eq('customer_id', customerId)
      ]);

      setPortalData({
        customer: customerRes.data,
        jobs: jobsRes.data || [],
        estimates: estimatesRes.data || [],
        invoices: invoicesRes.data || [],
        documents: [] // Would fetch related documents
      });

    } catch (error: any) {
      console.error('Error fetching portal data:', error);
      toast.error('Failed to load portal data');
    }
  };

  return {
    isAuthenticated,
    isLoading,
    error,
    portalData
  };
};
