import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { EstimateLineItem, ApiError } from '@/types/app-types';
import { useErrorHandler } from './useErrorHandler';
import { useOptimisticUpdate } from './useOptimisticUpdate';

type EstimateLineItemInsert = TablesInsert<'estimate_line_items'>;
type EstimateLineItemUpdate = TablesUpdate<'estimate_line_items'>;

interface UseEstimateLineItemsReturn {
  lineItems: EstimateLineItem[];
  loading: boolean;
  error: Error | null;
  fetchLineItems: () => Promise<void>;
  addLineItem: (itemData: Omit<EstimateLineItemInsert, 'estimate_id' | 'total'>) => Promise<EstimateLineItem | null>;
  addMultipleLineItems: (targetEstimateId: string, itemsData: Array<Omit<EstimateLineItemInsert, 'estimate_id' | 'total' | 'sort_order'>>) => Promise<EstimateLineItem[] | null>;
  updateLineItem: (id: string, updates: EstimateLineItemUpdate) => Promise<EstimateLineItem | null>;
  deleteLineItem: (id: string) => Promise<void>;
  reorderLineItems: (reorderedItems: EstimateLineItem[]) => Promise<void>;
}

const isSupabaseError = (error: unknown): error is ApiError => {
  return typeof error === 'object' && error !== null && 'error' in error && typeof (error as ApiError).error === 'object';
};

export const useEstimateLineItems = (estimateId?: string): UseEstimateLineItemsReturn => {
  const { user, session } = useAuth();
  const [lineItems, setLineItems] = useState<EstimateLineItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { handleError } = useErrorHandler();
  const { executeUpdate } = useOptimisticUpdate();

  const validateUserAndSession = () => {
    if (!user || !session) {
      const errorMsg = 'Authentication required. Please log in again.';
      setError(new Error(errorMsg));
      toast.error(errorMsg);
      return false;
    }
    return true;
  };

  const fetchLineItems = async () => {
    if (!estimateId) return;
    if (!validateUserAndSession()) return;

    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('estimate_line_items')
        .select('*')
        .eq('estimate_id', estimateId)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setLineItems(data || []);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error);
        handleError(error, { title: 'Failed to fetch line items' });
      } else if (isSupabaseError(error)) {
        const supabaseError = new Error(error.error.message);
        setError(supabaseError);
        handleError(supabaseError, { title: 'Failed to fetch line items' });
      } else {
        const fallbackError = new Error('An unexpected error occurred while fetching line items');
        setError(fallbackError);
        handleError(fallbackError, { title: 'Failed to fetch line items' });
      }
      setLineItems([]);
    } finally {
      setLoading(false);
    }
  };

  const addLineItem = async (itemData: Omit<EstimateLineItemInsert, 'estimate_id' | 'total'>) => {
    if (!estimateId) {
      handleError(new Error('No estimate ID provided'), { title: 'Failed to add line item' });
      return null;
    }

    if (!validateUserAndSession()) return null;

    // Optimistic update
    const optimisticItem: EstimateLineItem = {
      id: `temp-${Date.now()}`,
      estimate_id: estimateId,
      description: itemData.description,
      quantity: itemData.quantity,
      unit_price: itemData.unit_price,
      total: Number(itemData.quantity) * Number(itemData.unit_price),
      sort_order: lineItems.length,
      created_at: new Date().toISOString(),
    } as EstimateLineItem;

    try {
      return await executeUpdate(
        // Optimistic update
        () => setLineItems(prev => [...prev, optimisticItem]),
        // Actual update
        async () => {
          const { data, error } = await supabase
            .from('estimate_line_items')
            .insert({
              ...itemData,
              estimate_id: estimateId,
              sort_order: lineItems.length
            })
            .select()
            .single();

          if (error) throw error;

          // Replace optimistic with real data
          setLineItems(prev => prev.map(item =>
            item.id === optimisticItem.id ? data : item
          ));

          return data;
        },
        // Rollback
        () => setLineItems(prev => prev.filter(item => item.id !== optimisticItem.id)),
        {
          successMessage: 'Line item added',
          errorMessage: 'Failed to add line item'
        }
      );
    } catch (error: unknown) {
      return null;
    }
  };

  const addMultipleLineItems = async (targetEstimateId: string, itemsData: Array<Omit<EstimateLineItemInsert, 'estimate_id' | 'total' | 'sort_order'>>) => {
    if (!targetEstimateId) {
      handleError(new Error('Estimate ID is required to add line items'), { title: 'Failed to add line items' });
      return null;
    }

    if (!validateUserAndSession()) return null;

    if (!itemsData || itemsData.length === 0) {
      return [];
    }

    // Filter out empty line items
    const validItems = itemsData.filter(item => item.description && item.description.trim());

    if (validItems.length === 0) {
      return [];
    }

    const itemsToInsert = validItems.map((item, index) => ({
      estimate_id: targetEstimateId,
      description: item.description,
      quantity: item.quantity || 1,
      unit_price: item.unit_price || 0,
      sort_order: index
    }));

    // Optimistic updates
    const optimisticItems: EstimateLineItem[] = itemsToInsert.map((item, index) => ({
      id: `temp-${Date.now()}-${index}`,
      estimate_id: targetEstimateId,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total: Number(item.quantity) * Number(item.unit_price),
      sort_order: item.sort_order,
      created_at: new Date().toISOString(),
    } as EstimateLineItem));

    try {
      return await executeUpdate(
        // Optimistic update
        () => setLineItems(prev => [...prev, ...optimisticItems]),
        // Actual update
        async () => {
          const { data, error } = await supabase
            .from('estimate_line_items')
            .insert(itemsToInsert)
            .select();

          if (error) throw error;

          // Replace optimistic items with real data
          setLineItems(prev => {
            const newItems = prev.filter(item => !item.id.startsWith('temp-'));
            return [...newItems, ...(data || [])].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
          });

          return data;
        },
        // Rollback
        () => setLineItems(prev => prev.filter(item => !optimisticItems.some(opt => opt.id === item.id))),
        {
          successMessage: `${itemsToInsert.length} line items added successfully`,
          errorMessage: 'Failed to add line items'
        }
      );
    } catch (error: unknown) {
      return null;
    }
  };

  const updateLineItem = async (id: string, updates: EstimateLineItemUpdate) => {
    if (!validateUserAndSession()) return null;

    const originalItem = lineItems.find(item => item.id === id);
    if (!originalItem) {
      handleError(new Error('Line item not found'), { title: 'Failed to update line item' });
      return null;
    }

    // Calculate new total if quantity or price changed
    const updatedItem = {
      ...originalItem,
      ...updates,
      total: updates.quantity !== undefined && updates.unit_price !== undefined
        ? Number(updates.quantity) * Number(updates.unit_price)
        : updates.quantity !== undefined
          ? Number(updates.quantity) * Number(originalItem.unit_price)
          : updates.unit_price !== undefined
            ? Number(originalItem.quantity) * Number(updates.unit_price)
            : originalItem.total
    };

    try {
      return await executeUpdate(
        // Optimistic update
        () => setLineItems(prev => prev.map(item => item.id === id ? updatedItem : item)),
        // Actual update
        async () => {
          const updatesToSend = {
            ...updates,
            total: updatedItem.total
          };

          const { data, error } = await supabase
            .from('estimate_line_items')
            .update(updatesToSend)
            .eq('id', id)
            .select()
            .single();

          if (error) throw error;

          // Update with real data
          setLineItems(prev => prev.map(item => item.id === id ? data : item));
          return data;
        },
        // Rollback
        () => setLineItems(prev => prev.map(item => item.id === id ? originalItem : item)),
        {
          successMessage: 'Line item updated',
          errorMessage: 'Failed to update line item'
        }
      );
    } catch (error: unknown) {
      return null;
    }
  };

  const deleteLineItem = async (id: string) => {
    if (!validateUserAndSession()) return;

    const originalItem = lineItems.find(item => item.id === id);
    if (!originalItem) {
      handleError(new Error('Line item not found'), { title: 'Failed to delete line item' });
      return;
    }

    try {
      await executeUpdate(
        // Optimistic update
        () => setLineItems(prev => prev.filter(item => item.id !== id)),
        // Actual update
        async () => {
          const { error } = await supabase
            .from('estimate_line_items')
            .delete()
            .eq('id', id);

          if (error) throw error;
          return true;
        },
        // Rollback
        () => setLineItems(prev => [...prev, originalItem].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))),
        {
          successMessage: 'Line item deleted',
          errorMessage: 'Failed to delete line item'
        }
      );
    } catch (error: unknown) {
      // Error handling is managed by executeUpdate
    }
  };

  const reorderLineItems = async (reorderedItems: EstimateLineItem[]) => {
    if (!validateUserAndSession()) return;

    const originalItems = [...lineItems];

    try {
      await executeUpdate(
        // Optimistic update
        () => setLineItems(reorderedItems),
        // Actual update
        async () => {
          const updates = reorderedItems.map((item, index) => ({
            id: item.id,
            sort_order: index
          }));

          for (const update of updates) {
            const { error } = await supabase
              .from('estimate_line_items')
              .update({ sort_order: update.sort_order })
              .eq('id', update.id);

            if (error) throw error;
          }
          return true;
        },
        // Rollback
        () => setLineItems(originalItems),
        {
          successMessage: 'Line items reordered',
          errorMessage: 'Failed to reorder line items'
        }
      );
    } catch (error: unknown) {
      // Error handling is managed by executeUpdate
    }
  };

  useEffect(() => {
    if (estimateId) {
      fetchLineItems();
    }
  }, [estimateId, user, session]);

  return {
    lineItems,
    loading,
    error,
    fetchLineItems,
    addLineItem,
    addMultipleLineItems,
    updateLineItem,
    deleteLineItem,
    reorderLineItems
  };
};
