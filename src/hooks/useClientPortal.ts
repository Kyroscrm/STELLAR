
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ClientPortalAuth {
  customerId: string | null;
  userId: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export const useClientPortalAuth = (token?: string) => {
  const [auth, setAuth] = useState<ClientPortalAuth>({
    customerId: null,
    userId: null,
    isAuthenticated: false,
    isLoading: true,
    error: null
  });

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setAuth(prev => ({ ...prev, isLoading: false, error: 'No token provided' }));
        return;
      }

      try {
        const { data, error } = await supabase
          .rpc('validate_client_portal_token', { p_token: token });

        if (error) throw error;

        if (data && data.length > 0 && data[0].is_valid) {
          setAuth({
            customerId: data[0].customer_id,
            userId: data[0].user_id,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });
          
          // Store in session storage for persistence
          sessionStorage.setItem('client_portal_auth', JSON.stringify({
            customerId: data[0].customer_id,
            userId: data[0].user_id,
            token
          }));
        } else {
          setAuth(prev => ({ ...prev, isLoading: false, error: 'Invalid or expired token' }));
        }
      } catch (error: any) {
        console.error('Token validation error:', error);
        setAuth(prev => ({ ...prev, isLoading: false, error: error.message }));
        toast.error('Authentication failed');
      }
    };

    // Check session storage first
    const stored = sessionStorage.getItem('client_portal_auth');
    if (stored && !token) {
      try {
        const parsed = JSON.parse(stored);
        setAuth({
          customerId: parsed.customerId,
          userId: parsed.userId,
          isAuthenticated: true,
          isLoading: false,
          error: null
        });
        return;
      } catch (e) {
        sessionStorage.removeItem('client_portal_auth');
      }
    }

    validateToken();
  }, [token]);

  const logout = () => {
    sessionStorage.removeItem('client_portal_auth');
    setAuth({
      customerId: null,
      userId: null,
      isAuthenticated: false,
      isLoading: false,
      error: null
    });
  };

  return { ...auth, logout };
};

export const useClientPortalData = (customerId: string | null) => {
  const [data, setData] = useState({
    customer: null,
    jobs: [],
    estimates: [],
    invoices: [],
    documents: [],
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!customerId) return;

      try {
        setData(prev => ({ ...prev, loading: true }));

        // Fetch customer data
        const { data: customer, error: customerError } = await supabase
          .from('customers')
          .select('*')
          .eq('id', customerId)
          .single();

        if (customerError) throw customerError;

        // Fetch jobs
        const { data: jobs, error: jobsError } = await supabase
          .from('jobs')
          .select('*')
          .eq('customer_id', customerId)
          .order('created_at', { ascending: false });

        if (jobsError) throw jobsError;

        // Fetch estimates
        const { data: estimates, error: estimatesError } = await supabase
          .from('estimates')
          .select(`
            *,
            estimate_line_items (*)
          `)
          .eq('customer_id', customerId)
          .order('created_at', { ascending: false });

        if (estimatesError) throw estimatesError;

        // Fetch invoices
        const { data: invoices, error: invoicesError } = await supabase
          .from('invoices')
          .select(`
            *,
            invoice_line_items (*)
          `)
          .eq('customer_id', customerId)
          .order('created_at', { ascending: false });

        if (invoicesError) throw invoicesError;

        // Fetch documents
        const { data: documents, error: documentsError } = await supabase
          .from('documents')
          .select('*')
          .in('entity_id', [
            ...(jobs?.map(j => j.id) || []),
            ...(estimates?.map(e => e.id) || []),
            ...(invoices?.map(i => i.id) || [])
          ])
          .order('created_at', { ascending: false });

        if (documentsError) throw documentsError;

        setData({
          customer,
          jobs: jobs || [],
          estimates: estimates || [],
          invoices: invoices || [],
          documents: documents || [],
          loading: false,
          error: null
        });

      } catch (error: any) {
        console.error('Error fetching client portal data:', error);
        setData(prev => ({ ...prev, loading: false, error: error.message }));
        toast.error('Failed to load data');
      }
    };

    fetchData();
  }, [customerId]);

  return data;
};
