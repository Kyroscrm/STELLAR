
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export type Estimate = Tables<'estimates'>;
type EstimateInsert = Omit<TablesInsert<'estimates'>, 'user_id'>;
type EstimateUpdate = TablesUpdate<'estimates'>;

// Extended Estimate type with customer data
export type EstimateWithCustomer = Estimate & {
  customers?: {
    id: string;
    first_name: string;
    last_name: string;
    email?: string;
    phone?: string;
  };
};

export const useEstimates = () => {
  const [estimates, setEstimates] = useState<EstimateWithCustomer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { user, session } = useAuth();

  const validateUserAndSession = () => {
    if (!user || !session) {
      const errorMsg = 'Authentication required. Please log in again.';
      setError(new Error(errorMsg));
      toast.error(errorMsg);
      return false;
    }
    return true;
  };

  const fetchEstimates = async () => {
    if (!validateUserAndSession()) return;
    
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching estimates for user:', user.id);
      
      const { data, error } = await supabase
        .from('estimates')
        .select(`
          *,
          customers (
            id,
            first_name,
            last_name,
            email,
            phone
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setEstimates(data || []);
      console.log(`Successfully fetched ${data?.length || 0} estimates`);
    } catch (error: any) {
      console.error('Error fetching estimates:', error);
      setError(error);
      toast.error('Failed to fetch estimates');
      setEstimates([]);
    } finally {
      setLoading(false);
    }
  };

  const createEstimate = async (estimateData: EstimateInsert) => {
    if (!validateUserAndSession()) return null;

    const optimisticEstimate: EstimateWithCustomer = {
      id: `temp-${Date.now()}`,
      ...estimateData,
      user_id: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    } as EstimateWithCustomer;

    // Optimistic update
    setEstimates(prev => [optimisticEstimate, ...prev]);

    try {
      console.log('Creating estimate:', estimateData);
      
      const { data, error } = await supabase
        .from('estimates')
        .insert({ ...estimateData, user_id: user.id })
        .select(`
          *,
          customers (
            id,
            first_name,
            last_name,
            email,
            phone
          )
        `)
        .single();

      if (error) throw error;
      
      // Replace optimistic with real data
      setEstimates(prev => prev.map(e => e.id === optimisticEstimate.id ? data : e));
      
      // Log activity
      await supabase.from('activity_logs').insert({
        user_id: user.id,
        entity_type: 'estimate',
        entity_id: data.id,
        action: 'created',
        description: `Estimate created: ${data.title}`
      });

      toast.success('Estimate created successfully');
      console.log('Estimate created successfully:', data);
      return data;
    } catch (error: any) {
      console.error('Error creating estimate:', error);
      // Rollback optimistic update
      setEstimates(prev => prev.filter(e => e.id !== optimisticEstimate.id));
      toast.error(error.message || 'Failed to create estimate');
      return null;
    }
  };

  const updateEstimate = async (id: string, updates: EstimateUpdate) => {
    if (!validateUserAndSession()) return false;

    // Store original for rollback
    const originalEstimate = estimates.find(e => e.id === id);
    if (!originalEstimate) {
      toast.error('Estimate not found');
      return false;
    }

    // Optimistic update
    const optimisticEstimate = { ...originalEstimate, ...updates, updated_at: new Date().toISOString() };
    setEstimates(prev => prev.map(e => e.id === id ? optimisticEstimate : e));

    try {
      console.log('Updating estimate:', id, updates);
      
      const { data, error } = await supabase
        .from('estimates')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select(`
          *,
          customers (
            id,
            first_name,
            last_name,
            email,
            phone
          )
        `)
        .single();

      if (error) throw error;
      
      // Update with real data
      setEstimates(prev => prev.map(e => e.id === id ? data : e));
      
      // Log activity
      await supabase.from('activity_logs').insert({
        user_id: user.id,
        entity_type: 'estimate',
        entity_id: id,
        action: 'updated',
        description: `Estimate updated: ${data.title}`
      });

      toast.success('Estimate updated successfully');
      console.log('Estimate updated successfully:', data);
      return true;
    } catch (error: any) {
      console.error('Error updating estimate:', error);
      // Rollback optimistic update
      setEstimates(prev => prev.map(e => e.id === id ? originalEstimate : e));
      toast.error(error.message || 'Failed to update estimate');
      return false;
    }
  };

  const deleteEstimate = async (id: string) => {
    if (!validateUserAndSession()) return;

    // Store original for rollback
    const originalEstimate = estimates.find(e => e.id === id);
    if (!originalEstimate) {
      toast.error('Estimate not found');
      return;
    }

    // Optimistic update
    setEstimates(prev => prev.filter(e => e.id !== id));

    try {
      console.log('Deleting estimate:', id);
      
      const { error } = await supabase
        .from('estimates')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      
      // Log activity
      await supabase.from('activity_logs').insert({
        user_id: user.id,
        entity_type: 'estimate',
        entity_id: id,
        action: 'deleted',
        description: `Estimate deleted: ${originalEstimate.title}`
      });

      toast.success('Estimate deleted successfully');
      console.log('Estimate deleted successfully');
    } catch (error: any) {
      console.error('Error deleting estimate:', error);
      // Rollback optimistic update
      setEstimates(prev => [...prev, originalEstimate].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ));
      toast.error(error.message || 'Failed to delete estimate');
    }
  };

  useEffect(() => {
    fetchEstimates();
  }, [user, session]);

  return {
    estimates,
    loading,
    error,
    fetchEstimates,
    createEstimate,
    updateEstimate,
    deleteEstimate
  };
};
