
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useActivityLogs } from '@/hooks/useActivityLogs';
import { toast } from 'sonner';

export interface Estimate {
  id: string;
  user_id: string;
  customer_id?: string;
  job_id?: string;
  estimate_number: string;
  title: string;
  description?: string;
  status: 'draft' | 'sent' | 'approved' | 'rejected' | 'expired';
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total_amount: number;
  valid_until?: string;
  terms?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export const useEstimates = () => {
  const { user } = useAuth();
  const { logActivity } = useActivityLogs();
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchEstimates = async () => {
    if (!user) return;

    setLoading(true);
    try {
      console.log('Fetching estimates for user:', user.id);
      
      const { data, error } = await supabase
        .from('estimates')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setEstimates(data || []);
      console.log(`Successfully fetched ${data?.length || 0} estimates`);
    } catch (error: any) {
      console.error('Error fetching estimates:', error);
      toast.error('Failed to fetch estimates');
    } finally {
      setLoading(false);
    }
  };

  const createEstimate = async (estimateData: Omit<Estimate, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) {
      toast.error('Authentication required');
      return null;
    }

    // Optimistic update
    const tempEstimate: Estimate = {
      ...estimateData,
      id: `temp-${Date.now()}`,
      user_id: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setEstimates(prev => [tempEstimate, ...prev]);

    try {
      console.log('Creating estimate:', estimateData);
      
      const { data, error } = await supabase
        .from('estimates')
        .insert({
          ...estimateData,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      // Replace optimistic update with real data
      setEstimates(prev => prev.map(e => e.id === tempEstimate.id ? data : e));
      
      await logActivity('create', 'estimate', data.id, `Created estimate: ${data.estimate_number}`);
      toast.success('Estimate created successfully');
      return data;
    } catch (error: any) {
      console.error('Error creating estimate:', error);
      // Rollback optimistic update
      setEstimates(prev => prev.filter(e => e.id !== tempEstimate.id));
      toast.error('Failed to create estimate');
      return null;
    }
  };

  const updateEstimate = async (id: string, updates: Partial<Omit<Estimate, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => {
    if (!user) {
      toast.error('Authentication required');
      return false;
    }

    // Optimistic update
    const optimisticEstimate = estimates.find(e => e.id === id);
    if (optimisticEstimate) {
      setEstimates(prev => prev.map(e => 
        e.id === id ? { ...e, ...updates, updated_at: new Date().toISOString() } : e
      ));
    }

    try {
      console.log('Updating estimate:', id, updates);
      
      const { data, error } = await supabase
        .from('estimates')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      
      // Update with real data
      setEstimates(prev => prev.map(e => e.id === id ? data : e));
      
      await logActivity('update', 'estimate', id, `Updated estimate: ${data.estimate_number}`);
      toast.success('Estimate updated successfully');
      return true;
    } catch (error: any) {
      console.error('Error updating estimate:', error);
      // Rollback optimistic update
      if (optimisticEstimate) {
        setEstimates(prev => prev.map(e => e.id === id ? optimisticEstimate : e));
      }
      toast.error('Failed to update estimate');
      return false;
    }
  };

  const deleteEstimate = async (id: string) => {
    if (!user) {
      toast.error('Authentication required');
      return false;
    }

    // Optimistic update
    const estimateToDelete = estimates.find(e => e.id === id);
    setEstimates(prev => prev.filter(e => e.id !== id));

    try {
      console.log('Deleting estimate:', id);
      
      const { error } = await supabase
        .from('estimates')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      
      await logActivity('delete', 'estimate', id, `Deleted estimate: ${estimateToDelete?.estimate_number}`);
      toast.success('Estimate deleted successfully');
      return true;
    } catch (error: any) {
      console.error('Error deleting estimate:', error);
      // Rollback optimistic update
      if (estimateToDelete) {
        setEstimates(prev => [...prev, estimateToDelete].sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        ));
      }
      toast.error('Failed to delete estimate');
      return false;
    }
  };

  useEffect(() => {
    fetchEstimates();
  }, [user]);

  return {
    estimates,
    loading,
    createEstimate,
    updateEstimate,
    deleteEstimate,
    fetchEstimates
  };
};
