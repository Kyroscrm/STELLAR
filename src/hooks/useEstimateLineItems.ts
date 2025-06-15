
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { toast } from 'sonner';

export type EstimateLineItem = Tables<'estimate_line_items'>;
type EstimateLineItemInsert = TablesInsert<'estimate_line_items'>;
type EstimateLineItemUpdate = TablesUpdate<'estimate_line_items'>;

export const useEstimateLineItems = (estimateId?: string) => {
  const [lineItems, setLineItems] = useState<EstimateLineItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchLineItems = async () => {
    if (!estimateId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('estimate_line_items')
        .select('*')
        .eq('estimate_id', estimateId)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setLineItems(data || []);
    } catch (error: any) {
      console.error('Error fetching line items:', error);
      toast.error('Failed to fetch line items');
    } finally {
      setLoading(false);
    }
  };

  const addLineItem = async (estimateId: string, itemData: Omit<EstimateLineItemInsert, 'estimate_id'>) => {
    try {
      const total = Number(itemData.quantity) * Number(itemData.unit_price);
      
      const { data, error } = await supabase
        .from('estimate_line_items')
        .insert({ 
          ...itemData, 
          estimate_id: estimateId,
          total,
          sort_order: lineItems.length
        })
        .select()
        .single();

      if (error) throw error;
      
      setLineItems(prev => [...prev, data]);
      toast.success('Line item added');
      return data;
    } catch (error: any) {
      console.error('Error adding line item:', error);
      toast.error('Failed to add line item');
      return null;
    }
  };

  const updateLineItem = async (id: string, updates: EstimateLineItemUpdate) => {
    try {
      const total = updates.quantity && updates.unit_price 
        ? Number(updates.quantity) * Number(updates.unit_price)
        : undefined;

      const { data, error } = await supabase
        .from('estimate_line_items')
        .update({ ...updates, total })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setLineItems(prev => prev.map(item => item.id === id ? data : item));
      toast.success('Line item updated');
      return data;
    } catch (error: any) {
      console.error('Error updating line item:', error);
      toast.error('Failed to update line item');
      return null;
    }
  };

  const deleteLineItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('estimate_line_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setLineItems(prev => prev.filter(item => item.id !== id));
      toast.success('Line item deleted');
    } catch (error: any) {
      console.error('Error deleting line item:', error);
      toast.error('Failed to delete line item');
    }
  };

  const reorderLineItems = async (reorderedItems: EstimateLineItem[]) => {
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

      setLineItems(reorderedItems);
    } catch (error: any) {
      console.error('Error reordering line items:', error);
      toast.error('Failed to reorder line items');
    }
  };

  useEffect(() => {
    fetchLineItems();
  }, [estimateId]);

  return {
    lineItems,
    loading,
    fetchLineItems,
    addLineItem,
    updateLineItem,
    deleteLineItem,
    reorderLineItems
  };
};
