
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
  const { user } = useAuth();

  const fetchEstimates = async () => {
    if (!user) {
      setEstimates([]);
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
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
      console.log(`Fetched ${data?.length || 0} estimates`);
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
    if (!user) {
      toast.error('You must be logged in to create estimates');
      return null;
    }

    // Validate UUID fields - don't submit empty strings
    const cleanedData = { ...estimateData };
    if (!cleanedData.customer_id || cleanedData.customer_id.trim() === '') {
      toast.error('Please select a customer');
      return null;
    }
    if (cleanedData.job_id && cleanedData.job_id.trim() === '') {
      delete cleanedData.job_id;
    }

    try {
      const { data, error } = await supabase
        .from('estimates')
        .insert({ ...cleanedData, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      
      setEstimates(prev => [data, ...prev]);
      toast.success('Estimate created successfully');
      
      // Log activity
      await supabase.from('activity_logs').insert({
        user_id: user.id,
        entity_type: 'estimate',
        entity_id: data.id,
        action: 'created',
        description: `Estimate created: ${data.title}`,
        metadata: { estimate_number: data.estimate_number }
      });

      return data;
    } catch (error: any) {
      console.error('Error creating estimate:', error);
      toast.error(error.message || 'Failed to create estimate');
      return null;
    }
  };

  const updateEstimate = async (id: string, updates: EstimateUpdate) => {
    if (!user) {
      toast.error('You must be logged in to update estimates');
      return false;
    }

    try {
      const { data, error } = await supabase
        .from('estimates')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      
      setEstimates(prev => prev.map(estimate => estimate.id === id ? data : estimate));
      toast.success('Estimate updated successfully');
      
      // Log activity
      await supabase.from('activity_logs').insert({
        user_id: user.id,
        entity_type: 'estimate',
        entity_id: id,
        action: 'updated',
        description: `Estimate updated`,
        metadata: { updates: Object.keys(updates) }
      });

      return true;
    } catch (error: any) {
      console.error('Error updating estimate:', error);
      toast.error(error.message || 'Failed to update estimate');
      return false;
    }
  };

  const deleteEstimate = async (id: string) => {
    if (!user) {
      toast.error('You must be logged in to delete estimates');
      return;
    }

    try {
      const { error } = await supabase
        .from('estimates')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      
      setEstimates(prev => prev.filter(estimate => estimate.id !== id));
      toast.success('Estimate deleted successfully');
      
      // Log activity
      await supabase.from('activity_logs').insert({
        user_id: user.id,
        entity_type: 'estimate',
        entity_id: id,
        action: 'deleted',
        description: `Estimate deleted`
      });
    } catch (error: any) {
      console.error('Error deleting estimate:', error);
      toast.error(error.message || 'Failed to delete estimate');
    }
  };

  useEffect(() => {
    fetchEstimates();
  }, [user]);

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
