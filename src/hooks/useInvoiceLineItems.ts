import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { InvoiceLineItem, ApiError } from '@/types/app-types';
import { useErrorHandler } from './useErrorHandler';
import { useOptimisticUpdate } from './useOptimisticUpdate';

type InvoiceLineItemInsert = TablesInsert<'invoice_line_items'>;
type InvoiceLineItemUpdate = TablesUpdate<'invoice_line_items'>;

interface UseInvoiceLineItemsReturn {
  lineItems: InvoiceLineItem[];
  loading: boolean;
  error: Error | null;
  fetchLineItems: () => Promise<void>;
  addLineItem: (itemData: Omit<InvoiceLineItemInsert, 'invoice_id' | 'total'>) => Promise<InvoiceLineItem | null>;
  addMultipleLineItems: (targetInvoiceId: string, itemsData: Array<Omit<InvoiceLineItemInsert, 'invoice_id' | 'total' | 'sort_order'>>) => Promise<InvoiceLineItem[] | null>;
  updateLineItem: (id: string, updates: InvoiceLineItemUpdate) => Promise<InvoiceLineItem | null>;
  deleteLineItem: (id: string) => Promise<void>;
  reorderLineItems: (reorderedItems: InvoiceLineItem[]) => Promise<void>;
}

const isSupabaseError = (error: unknown): error is ApiError => {
  return typeof error === 'object' && error !== null && 'error' in error && typeof (error as ApiError).error === 'object';
};

function dedupeLineItems(items: InvoiceLineItem[]): InvoiceLineItem[] {
  const seen = new Map<string, InvoiceLineItem>();
  for (const item of items) {
    seen.set(item.id, item);
  }
  return Array.from(seen.values());
}

export const useInvoiceLineItems = (invoiceId?: string): UseInvoiceLineItemsReturn => {
  const { user, session } = useAuth();
  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>([]);
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
    if (!invoiceId) return;
    if (!validateUserAndSession()) return;

    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('invoice_line_items')
        .select('*')
        .eq('invoice_id', invoiceId)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setLineItems(data ? dedupeLineItems(data) : []);
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

  const addLineItem = async (itemData: Omit<InvoiceLineItemInsert, 'invoice_id' | 'total'>) => {
    if (!invoiceId) {
      handleError(new Error('No invoice ID provided'), { title: 'Failed to add line item' });
      return null;
    }

    if (!validateUserAndSession()) return null;

    // Optimistic update
    const optimisticItem: InvoiceLineItem = {
      id: `temp-${Date.now()}`,
      invoice_id: invoiceId,
      description: itemData.description,
      quantity: itemData.quantity,
      unit_price: itemData.unit_price,
      total: Number(itemData.quantity) * Number(itemData.unit_price),
      sort_order: lineItems.length,
      created_at: new Date().toISOString(),
    } as InvoiceLineItem;

    try {
      return await executeUpdate(
        // Optimistic update
        () => setLineItems(prev => dedupeLineItems([...prev, optimisticItem])),
        // Actual update
        async () => {
          const { data, error } = await supabase
            .from('invoice_line_items')
            .insert({
              ...itemData,
              invoice_id: invoiceId,
              sort_order: lineItems.length
            })
            .select()
            .single();

          if (error) throw error;

          // Replace optimistic with real data
          setLineItems(prev => dedupeLineItems(prev.map(item =>
            item.id === optimisticItem.id ? data : item
          )));

          return data;
        },
        // Rollback
        () => setLineItems(prev => dedupeLineItems(prev.filter(item => item.id !== optimisticItem.id))),
        {
          successMessage: 'Line item added',
          errorMessage: 'Failed to add line item'
        }
      );
    } catch (error: unknown) {
      return null;
    }
  };

  const addMultipleLineItems = async (targetInvoiceId: string, itemsData: Array<Omit<InvoiceLineItemInsert, 'invoice_id' | 'total' | 'sort_order'>>) => {
    if (!targetInvoiceId) {
      handleError(new Error('Invoice ID is required to add line items'), { title: 'Failed to add line items' });
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
      invoice_id: targetInvoiceId,
      description: item.description,
      quantity: item.quantity || 1,
      unit_price: item.unit_price || 0,
      sort_order: index
    }));

    // Optimistic updates
    const optimisticItems: InvoiceLineItem[] = itemsToInsert.map((item, index) => ({
      id: `temp-${Date.now()}-${index}`,
      invoice_id: targetInvoiceId,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total: Number(item.quantity) * Number(item.unit_price),
      sort_order: item.sort_order,
      created_at: new Date().toISOString(),
    } as InvoiceLineItem));

    try {
      return await executeUpdate(
        // Optimistic update
        () => setLineItems(prev => dedupeLineItems([...prev, ...optimisticItems])),
        // Actual update
        async () => {
          const { data, error } = await supabase
            .from('invoice_line_items')
            .insert(itemsToInsert)
            .select();

          if (error) throw error;

          // Replace optimistic items with real data
          setLineItems(prev => {
            const newItems = prev.filter(item => !item.id.startsWith('temp-'));
            return dedupeLineItems([...newItems, ...(data || [])]);
          });

          return data;
        },
        // Rollback
        () => setLineItems(prev => dedupeLineItems(prev.filter(item => !item.id.startsWith('temp-')))),
        {
          successMessage: 'Line items added',
          errorMessage: 'Failed to add line items'
        }
      );
    } catch (error: unknown) {
      return null;
    }
  };

  const updateLineItem = async (id: string, updates: InvoiceLineItemUpdate) => {
    if (!invoiceId) {
      handleError(new Error('No invoice ID provided'), { title: 'Failed to update line item' });
      return null;
    }
    if (!validateUserAndSession()) return null;

    try {
      return await executeUpdate(
        // Optimistic update
        () => setLineItems(prev => dedupeLineItems(prev.map(item =>
          item.id === id ? { ...item, ...updates } : item
        ))),
        // Actual update
        async () => {
          const { data, error } = await supabase
            .from('invoice_line_items')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

          if (error) throw error;

          setLineItems(prev => dedupeLineItems(prev.map(item =>
            item.id === id ? data : item
          )));

          return data;
        },
        // Rollback
        () => setLineItems(prev => dedupeLineItems(prev)),
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
    if (!invoiceId) {
      handleError(new Error('No invoice ID provided'), { title: 'Failed to delete line item' });
      return;
    }
    if (!validateUserAndSession()) return;

    try {
      await executeUpdate(
        // Optimistic update
        () => setLineItems(prev => dedupeLineItems(prev.filter(item => item.id !== id))),
        // Actual update
        async () => {
          const { error } = await supabase
            .from('invoice_line_items')
            .delete()
            .eq('id', id);

          if (error) throw error;
        },
        // Rollback
        () => setLineItems(prev => dedupeLineItems(prev)),
        {
          successMessage: 'Line item deleted',
          errorMessage: 'Failed to delete line item'
        }
      );
    } catch (error: unknown) {
      // No further action needed, error handled by executeUpdate
    }
  };

  const reorderLineItems = async (reorderedItems: InvoiceLineItem[]) => {
    if (!invoiceId) {
      handleError(new Error('No invoice ID provided'), { title: 'Failed to reorder line items' });
      return;
    }
    if (!validateUserAndSession()) return;

    // Optimistic update
    setLineItems(dedupeLineItems(reorderedItems));

    try {
      // Upsert must include all required fields
      const updates = reorderedItems.map(item => ({
        id: item.id,
        sort_order: item.sort_order,
        description: item.description,
        unit_price: item.unit_price,
        quantity: item.quantity,
        invoice_id: item.invoice_id
      }));
      const { error } = await supabase
        .from('invoice_line_items')
        .upsert(updates, { onConflict: 'id' });
      if (error) throw error;
      toast.success('Line items reordered');
    } catch (error: unknown) {
      handleError(error, { title: 'Failed to reorder line items' });
    }
  };

  useEffect(() => {
    fetchLineItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoiceId]);

  return {
    lineItems,
    loading,
    error,
    fetchLineItems,
    addLineItem,
    addMultipleLineItems,
    updateLineItem,
    deleteLineItem,
    reorderLineItems,
  };
};
