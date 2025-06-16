
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export type Estimate = Tables<'estimates'>;
export type EstimateLineItem = Tables<'estimate_line_items'>;
export type EstimateWithLineItems = Estimate & {
  estimate_line_items: EstimateLineItem[];
  customers?: { first_name: string; last_name: string };
};

type EstimateInsert = Omit<TablesInsert<'estimates'>, 'user_id'>;
type EstimateUpdate = TablesUpdate<'estimates'>;

export const useEstimates = () => {
  const [estimates, setEstimates] = useState<EstimateWithLineItems[]>([]);
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
          estimate_line_items(*),
          customers(first_name, last_name)
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

  const createEstimate = async (estimateData: EstimateInsert & { lineItems: any[] }) => {
    if (!user) {
      toast.error('You must be logged in to create estimates');
      return null;
    }

    try {
      const { lineItems, ...estimateFields } = estimateData;
      
      const { data: estimate, error: estimateError } = await supabase
        .from('estimates')
        .insert({ ...estimateFields, user_id: user.id })
        .select()
        .single();

      if (estimateError) throw estimateError;

      if (lineItems && lineItems.length > 0) {
        const lineItemsToInsert = lineItems.map(item => ({
          estimate_id: estimate.id,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total: item.quantity * item.unit_price
        }));

        const { error: lineItemsError } = await supabase
          .from('estimate_line_items')
          .insert(lineItemsToInsert);

        if (lineItemsError) throw lineItemsError;
      }
      
      await fetchEstimates();
      toast.success('Estimate created successfully');
      
      await supabase.from('activity_logs').insert({
        user_id: user.id,
        entity_type: 'estimate',
        entity_id: estimate.id,
        action: 'created',
        description: `Estimate created: ${estimate.title}`
      });

      return estimate;
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
      
      await fetchEstimates();
      toast.success('Estimate updated successfully');
      
      await supabase.from('activity_logs').insert({
        user_id: user.id,
        entity_type: 'estimate',
        entity_id: id,
        action: 'updated',
        description: `Estimate updated`
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
