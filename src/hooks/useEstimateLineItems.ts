import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export type EstimateLineItem = Tables<'estimate_line_items'>;
type EstimateLineItemInsert = TablesInsert<'estimate_line_items'>;
type EstimateLineItemUpdate = TablesUpdate<'estimate_line_items'>;

export const useEstimateLineItems = (estimateId?: string) => {
  const [lineItems, setLineItems] = useState<EstimateLineItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLineItems = async () => {
    if (!estimateId) return;

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
      // Error handled - line items fetch functionality preserved
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Failed to fetch line items');
      }
      toast.error('Failed to fetch line items');
    } finally {
      setLoading(false);
    }
  };

  const addLineItem = async (itemData: Omit<EstimateLineItemInsert, 'estimate_id' | 'total'>) => {
    if (!estimateId) {
      toast.error('No estimate ID provided');
      return null;
    }

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
    };

    setLineItems(prev => [...prev, optimisticItem]);

    try {
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

      toast.success('Line item added');
      return data;
    } catch (error: unknown) {
      // Error handled - rollback optimistic update
      setLineItems(prev => prev.filter(item => item.id !== optimisticItem.id));
      toast.error('Failed to add line item');
      return null;
    }
  };

  const addMultipleLineItems = async (targetEstimateId: string, itemsData: Array<Omit<EstimateLineItemInsert, 'estimate_id' | 'total' | 'sort_order'>>) => {
    if (!targetEstimateId) {
      toast.error('Estimate ID is required to add line items');
      return null;
    }

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
    }));

    setLineItems(prev => [...prev, ...optimisticItems]);

    try {
      const { data, error } = await supabase
        .from('estimate_line_items')
        .insert(itemsToInsert)
        .select();

      if (error) throw error;

      // Replace optimistic items with real data
      setLineItems(prev => {
        const newItems = prev.filter(item => !item.id.startsWith('temp-'));
        return [...newItems, ...(data || [])].sort((a, b) => a.sort_order - b.sort_order);
      });

      toast.success(`${data?.length || 0} line items added successfully`);
      return data;
    } catch (error: unknown) {
      // Error handled - rollback optimistic updates
      setLineItems(prev => prev.filter(item => !optimisticItems.some(opt => opt.id === item.id)));
      toast.error('Failed to add line items');
      return null;
    }
  };

  const updateLineItem = async (id: string, updates: EstimateLineItemUpdate) => {
    const originalItem = lineItems.find(item => item.id === id);
    if (!originalItem) return null;

    // Optimistic update
    const updatedItem = {
      ...originalItem,
      ...updates,
      total: updates.quantity && updates.unit_price
        ? Number(updates.quantity) * Number(updates.unit_price)
        : originalItem.total
    };

    setLineItems(prev => prev.map(item => item.id === id ? updatedItem : item));

    try {
      const { data, error } = await supabase
        .from('estimate_line_items')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Update with real data
      setLineItems(prev => prev.map(item => item.id === id ? data : item));
      return data;
    } catch (error: unknown) {
      // Error handled - rollback optimistic update
      setLineItems(prev => prev.map(item => item.id === id ? originalItem : item));
      toast.error('Failed to update line item');
      return null;
    }
  };

  const deleteLineItem = async (id: string) => {
    const originalItem = lineItems.find(item => item.id === id);
    if (!originalItem) return;

    // Optimistic update
    setLineItems(prev => prev.filter(item => item.id !== id));

    try {
      const { error } = await supabase
        .from('estimate_line_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Line item deleted');
    } catch (error: unknown) {
      // Error handled - rollback optimistic update
      setLineItems(prev => [...prev, originalItem].sort((a, b) => a.sort_order - b.sort_order));
      toast.error('Failed to delete line item');
    }
  };

  const reorderLineItems = async (reorderedItems: EstimateLineItem[]) => {
    const originalItems = [...lineItems];

    // Optimistic update
    setLineItems(reorderedItems);

    try {
      const updates = reorderedItems.map((item, index) => ({
        id: item.id,
        sort_order: index
      }));

      for (const update of updates) {
        await supabase
          .from('estimate_line_items')
          .update({ sort_order: update.sort_order })
          .eq('id', update.id);
      }
    } catch (error: unknown) {
      // Error handled - rollback optimistic update
      setLineItems(originalItems);
      toast.error('Failed to reorder line items');
    }
  };

  useEffect(() => {
    fetchLineItems();
  }, [estimateId]);

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
