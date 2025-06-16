
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export type Invoice = Tables<'invoices'>;
export type InvoiceLineItem = Tables<'invoice_line_items'>;
export type InvoiceWithLineItems = Invoice & {
  invoice_line_items: InvoiceLineItem[];
  customers?: { first_name: string; last_name: string };
};

type InvoiceInsert = Omit<TablesInsert<'invoices'>, 'user_id'>;
type InvoiceUpdate = TablesUpdate<'invoices'>;

export const useInvoices = () => {
  const [invoices, setInvoices] = useState<InvoiceWithLineItems[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  const fetchInvoices = async () => {
    if (!user) {
      setInvoices([]);
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          invoice_line_items(*),
          customers(first_name, last_name)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvoices(data || []);
      console.log(`Fetched ${data?.length || 0} invoices`);
    } catch (error: any) {
      console.error('Error fetching invoices:', error);
      setError(error);
      toast.error('Failed to fetch invoices');
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  const addInvoice = async (invoiceData: InvoiceInsert & { lineItems: any[] }) => {
    if (!user) {
      toast.error('You must be logged in to create invoices');
      return null;
    }

    try {
      const { lineItems, ...invoiceFields } = invoiceData;
      
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert({ ...invoiceFields, user_id: user.id })
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      if (lineItems && lineItems.length > 0) {
        const lineItemsToInsert = lineItems.map(item => ({
          invoice_id: invoice.id,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total: item.quantity * item.unit_price
        }));

        const { error: lineItemsError } = await supabase
          .from('invoice_line_items')
          .insert(lineItemsToInsert);

        if (lineItemsError) throw lineItemsError;
      }
      
      await fetchInvoices();
      toast.success('Invoice created successfully');
      
      await supabase.from('activity_logs').insert({
        user_id: user.id,
        entity_type: 'invoice',
        entity_id: invoice.id,
        action: 'created',
        description: `Invoice created: ${invoice.title}`
      });

      return invoice;
    } catch (error: any) {
      console.error('Error creating invoice:', error);
      toast.error(error.message || 'Failed to create invoice');
      return null;
    }
  };

  const updateInvoice = async (id: string, updates: InvoiceUpdate) => {
    if (!user) {
      toast.error('You must be logged in to update invoices');
      return false;
    }

    try {
      const { data, error } = await supabase
        .from('invoices')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      
      await fetchInvoices();
      toast.success('Invoice updated successfully');
      
      await supabase.from('activity_logs').insert({
        user_id: user.id,
        entity_type: 'invoice',
        entity_id: id,
        action: 'updated',
        description: `Invoice updated`
      });

      return true;
    } catch (error: any) {
      console.error('Error updating invoice:', error);
      toast.error(error.message || 'Failed to update invoice');
      return false;
    }
  };

  const deleteInvoice = async (id: string) => {
    if (!user) {
      toast.error('You must be logged in to delete invoices');
      return;
    }

    try {
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      
      setInvoices(prev => prev.filter(invoice => invoice.id !== id));
      toast.success('Invoice deleted successfully');
      
      await supabase.from('activity_logs').insert({
        user_id: user.id,
        entity_type: 'invoice',
        entity_id: id,
        action: 'deleted',
        description: `Invoice deleted`
      });
    } catch (error: any) {
      console.error('Error deleting invoice:', error);
      toast.error(error.message || 'Failed to delete invoice');
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [user]);

  return {
    invoices,
    loading,
    error,
    fetchInvoices,
    addInvoice,
    updateInvoice,
    deleteInvoice
  };
};
