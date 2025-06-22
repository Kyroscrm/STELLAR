
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useOptimisticUpdate } from './useOptimisticUpdate';
import { useErrorHandler } from './useErrorHandler';

export type Estimate = Tables<'estimates'>;
export type EstimateWithLineItems = Estimate & {
  estimate_line_items: Tables<'estimate_line_items'>[];
  customers?: {
    first_name: string;
    last_name: string;
  };
};

type EstimateInsert = Omit<TablesInsert<'estimates'>, 'user_id'>;
type EstimateUpdate = TablesUpdate<'estimates'>;

export const useEstimates = () => {
  const [estimates, setEstimates] = useState<EstimateWithLineItems[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { user, session } = useAuth();
  const { executeUpdate } = useOptimisticUpdate();
  const { handleError } = useErrorHandler();

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
          estimate_line_items (*),
          customers (
            first_name,
            last_name
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
      handleError(error, { title: 'Failed to fetch estimates' });
      setEstimates([]);
    } finally {
      setLoading(false);
    }
  };

  const createEstimate = async (estimateData: EstimateInsert & { lineItems?: any[] }) => {
    if (!validateUserAndSession()) return null;

    const { lineItems, ...estimateFields } = estimateData;
    const optimisticEstimate: EstimateWithLineItems = {
      id: `temp-${Date.now()}`,
      ...estimateFields,
      user_id: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      estimate_line_items: lineItems || []
    } as EstimateWithLineItems;

    try {
      return await executeUpdate(
        // Optimistic update
        () => setEstimates(prev => [optimisticEstimate, ...prev]),
        // Actual update
        async () => {
          console.log('Creating estimate:', estimateFields);
          
          const { data, error } = await supabase
            .from('estimates')
            .insert({ ...estimateFields, user_id: user.id })
            .select()
            .single();

          if (error) throw error;
          
          // Create line items if provided
          if (lineItems && lineItems.length > 0) {
            const lineItemsToInsert = lineItems.map(item => ({
              ...item,
              estimate_id: data.id
            }));
            
            const { error: lineItemsError } = await supabase
              .from('estimate_line_items')
              .insert(lineItemsToInsert);
              
            if (lineItemsError) throw lineItemsError;
          }
          
          // Fetch the complete estimate with line items
          const { data: completeEstimate, error: fetchError } = await supabase
            .from('estimates')
            .select(`
              *,
              estimate_line_items (*),
              customers (
                first_name,
                last_name
              )
            `)
            .eq('id', data.id)
            .single();
            
          if (fetchError) throw fetchError;
          
          // Replace optimistic with real data
          setEstimates(prev => prev.map(e => e.id === optimisticEstimate.id ? completeEstimate : e));
          
          // Log activity
          await supabase.from('activity_logs').insert({
            user_id: user.id,
            entity_type: 'estimate',
            entity_id: data.id,
            action: 'created',
            description: `Estimate created: ${data.title}`
          });

          console.log('Estimate created successfully:', completeEstimate);
          return completeEstimate;
        },
        // Rollback
        () => setEstimates(prev => prev.filter(e => e.id !== optimisticEstimate.id)),
        {
          successMessage: 'Estimate created successfully',
          errorMessage: 'Failed to create estimate'
        }
      );
    } catch (error: any) {
      console.error('Error creating estimate:', error);
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

    const optimisticEstimate = { ...originalEstimate, ...updates, updated_at: new Date().toISOString() };

    try {
      return await executeUpdate(
        // Optimistic update
        () => setEstimates(prev => prev.map(e => e.id === id ? optimisticEstimate : e)),
        // Actual update
        async () => {
          console.log('Updating estimate:', id, updates);
          
          const { data, error } = await supabase
            .from('estimates')
            .update(updates)
            .eq('id', id)
            .eq('user_id', user.id)
            .select()
            .single();

          if (error) throw error;
          
          // Fetch complete estimate with relations
          const { data: completeEstimate, error: fetchError } = await supabase
            .from('estimates')
            .select(`
              *,
              estimate_line_items (*),
              customers (
                first_name,
                last_name
              )
            `)
            .eq('id', id)
            .single();
            
          if (fetchError) throw fetchError;
          
          // Update with real data
          setEstimates(prev => prev.map(e => e.id === id ? completeEstimate : e));
          
          // Log activity
          await supabase.from('activity_logs').insert({
            user_id: user.id,
            entity_type: 'estimate',
            entity_id: id,
            action: 'updated',
            description: `Estimate updated: ${data.title}`
          });

          console.log('Estimate updated successfully:', completeEstimate);
          return true;
        },
        // Rollback
        () => setEstimates(prev => prev.map(e => e.id === id ? originalEstimate : e)),
        {
          successMessage: 'Estimate updated successfully',
          errorMessage: 'Failed to update estimate'
        }
      );
    } catch (error: any) {
      console.error('Error updating estimate:', error);
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

    try {
      await executeUpdate(
        // Optimistic update
        () => setEstimates(prev => prev.filter(e => e.id !== id)),
        // Actual update
        async () => {
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

          console.log('Estimate deleted successfully');
          return true;
        },
        // Rollback
        () => setEstimates(prev => [...prev, originalEstimate].sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )),
        {
          successMessage: 'Estimate deleted successfully',
          errorMessage: 'Failed to delete estimate'
        }
      );
    } catch (error: any) {
      console.error('Error deleting estimate:', error);
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
