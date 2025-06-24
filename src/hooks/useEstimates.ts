import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useErrorHandler } from './useErrorHandler';
import { useOptimisticUpdate } from './useOptimisticUpdate';
import { EstimateStatus, ApiError } from '@/types/app-types';
import { enforcePolicy, SecurityError, handleSupabaseError } from '@/lib/security';

export type Estimate = Tables<'estimates'>;
export type EstimateLineItem = Tables<'estimate_line_items'>;

export type EstimateWithLineItems = Estimate & {
  estimate_line_items: EstimateLineItem[];
  customers?: {
    first_name: string;
    last_name: string;
  };
};

type EstimateInsert = Omit<TablesInsert<'estimates'>, 'user_id'>;
type EstimateUpdate = TablesUpdate<'estimates'>;

export interface EstimateLineItemData {
  description: string;
  quantity: number;
  unit_price: number;
  total?: number;
  sort_order?: number;
}

interface UseEstimatesReturn {
  estimates: EstimateWithLineItems[];
  loading: boolean;
  error: Error | null;
  fetchEstimates: () => Promise<void>;
  createEstimate: (estimateData: EstimateInsert & { lineItems?: EstimateLineItemData[] }) => Promise<EstimateWithLineItems | null>;
  updateEstimate: (id: string, updates: EstimateUpdate) => Promise<boolean>;
  deleteEstimate: (id: string) => Promise<boolean>;
}

export const useEstimates = (): UseEstimatesReturn => {
  const [estimates, setEstimates] = useState<EstimateWithLineItems[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { user, session } = useAuth();
  const { executeUpdate } = useOptimisticUpdate();
  const { handleError } = useErrorHandler();

  const validateUserAndSession = (): boolean => {
    if (!user || !session) {
      const errorMsg = 'Authentication required. Please log in again.';
      setError(new Error(errorMsg));
      toast.error(errorMsg);
      return false;
    }
    return true;
  };

  const fetchEstimates = async (): Promise<void> => {
    if (!validateUserAndSession()) return;

    setLoading(true);
    setError(null);
    try {
      const data = await enforcePolicy('estimates:read', async () => {
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
        return data || [];
      });

      setEstimates(data);
    } catch (error: unknown) {
      if (error instanceof SecurityError) {
        setError(error);
        handleError(error, { title: 'Access Denied: You do not have permission to view estimates.' });
      } else {
        const processedError = handleSupabaseError(error);
        setError(processedError);
        handleError(processedError, { title: 'Failed to fetch estimates' });
      }
      setEstimates([]);
    } finally {
      setLoading(false);
    }
  };

  const createEstimate = async (estimateData: EstimateInsert & { lineItems?: EstimateLineItemData[] }): Promise<EstimateWithLineItems | null> => {
    if (!validateUserAndSession()) return null;

    const { lineItems, ...estimateFields } = estimateData;

    // Ensure status uses proper enum values, default to 'draft'
    const cleanedEstimateFields = {
      ...estimateFields,
      status: (estimateFields.status as EstimateStatus) || 'draft'
    };

    const optimisticEstimate: EstimateWithLineItems = {
      id: `temp-${Date.now()}`,
      ...cleanedEstimateFields,
      user_id: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      estimate_line_items: lineItems?.map(item => ({
        ...item,
        id: `temp-${Date.now()}-${Math.random()}`,
        estimate_id: `temp-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })) || []
    } as EstimateWithLineItems;

    try {
      return await executeUpdate(
        // Optimistic update
        () => setEstimates(prev => [optimisticEstimate, ...prev]),
        // Actual update
        async () => {
          const completeEstimate = await enforcePolicy('estimates:create', async () => {
            const { data, error } = await supabase
              .from('estimates')
              .insert({ ...cleanedEstimateFields, user_id: user.id })
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

            // Log activity
            await supabase.from('activity_logs').insert({
              user_id: user.id,
              entity_type: 'estimate',
              entity_id: data.id,
              action: 'created',
              description: `Estimate created: ${data.title}`
            });

            return completeEstimate;
          });

          // Replace optimistic with real data
          setEstimates(prev => prev.map(e => e.id === optimisticEstimate.id ? completeEstimate : e));
          return completeEstimate;
        },
        // Rollback
        () => setEstimates(prev => prev.filter(e => e.id !== optimisticEstimate.id)),
        {
          successMessage: 'Estimate created successfully',
          errorMessage: 'Failed to create estimate'
        }
      );
    } catch (error: unknown) {
      if (error instanceof SecurityError) {
        handleError(error, { title: 'Access Denied: You do not have permission to create estimates.' });
      } else {
        handleError(handleSupabaseError(error), { title: 'Failed to create estimate' });
      }
      return null;
    }
  };

  const updateEstimate = async (id: string, updates: EstimateUpdate): Promise<boolean> => {
    if (!validateUserAndSession()) return false;

    // Store original for rollback
    const originalEstimate = estimates.find(e => e.id === id);
    if (!originalEstimate) {
      handleError(new Error('Estimate not found'), { title: 'Update Failed' });
      return false;
    }

    // Ensure status uses valid enum values if being updated
    const cleanedUpdates = { ...updates };
    if (cleanedUpdates.status && !['draft', 'sent', 'accepted', 'rejected', 'expired'].includes(cleanedUpdates.status as EstimateStatus)) {
      delete cleanedUpdates.status;
    }

    const optimisticEstimate = { ...originalEstimate, ...cleanedUpdates, updated_at: new Date().toISOString() };

    try {
      return await executeUpdate(
        // Optimistic update
        () => setEstimates(prev => prev.map(e => e.id === id ? optimisticEstimate : e)),
        // Actual update
        async () => {
          const completeEstimate = await enforcePolicy('estimates:update', async () => {
            const { data, error } = await supabase
              .from('estimates')
              .update(cleanedUpdates)
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

            // Log activity
            await supabase.from('activity_logs').insert({
              user_id: user.id,
              entity_type: 'estimate',
              entity_id: id,
              action: 'updated',
              description: `Estimate updated: ${data.title}`
            });

            return completeEstimate;
          });

          // Update with real data
          setEstimates(prev => prev.map(e => e.id === id ? completeEstimate : e));
          return true;
        },
        // Rollback
        () => setEstimates(prev => prev.map(e => e.id === id ? originalEstimate : e)),
        {
          successMessage: 'Estimate updated successfully',
          errorMessage: 'Failed to update estimate'
        }
      );
    } catch (error: unknown) {
      if (error instanceof SecurityError) {
        handleError(error, { title: 'Access Denied: You do not have permission to update estimates.' });
      } else {
        handleError(handleSupabaseError(error), { title: 'Failed to update estimate' });
      }
      return false;
    }
  };

  const deleteEstimate = async (id: string): Promise<boolean> => {
    if (!validateUserAndSession()) return false;

    // Store original for rollback
    const originalEstimate = estimates.find(e => e.id === id);
    if (!originalEstimate) {
      handleError(new Error('Estimate not found'), { title: 'Delete Failed' });
      return false;
    }

    try {
      return await executeUpdate(
        // Optimistic update
        () => setEstimates(prev => prev.filter(e => e.id !== id)),
        // Actual update
        async () => {
          await enforcePolicy('estimates:delete', async () => {
            // First delete line items to avoid foreign key constraint errors
            const { error: lineItemsError } = await supabase
              .from('estimate_line_items')
              .delete()
              .eq('estimate_id', id);

            if (lineItemsError) throw lineItemsError;

            // Then delete the estimate
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

            return true;
          });

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
    } catch (error: unknown) {
      if (error instanceof SecurityError) {
        handleError(error, { title: 'Access Denied: You do not have permission to delete estimates.' });
      } else {
        handleError(handleSupabaseError(error), { title: 'Failed to delete estimate' });
      }
      return false;
    }
  };

  useEffect(() => {
    if (user && session) {
      fetchEstimates();
    }
  }, [user?.id]);

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
