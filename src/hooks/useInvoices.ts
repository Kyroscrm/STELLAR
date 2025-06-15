
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export type Invoice = Tables<'invoices'>;
export type InvoiceLineItem = Tables<'invoice_line_items'>;
export type InvoiceWithLineItems = Invoice & {
  invoice_line_items?: InvoiceLineItem[];
  customers?: Tables<'customers'>;
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
          invoice_line_items (*),
          customers (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvoices(data || []);
    } catch (error: any) {
      console.error('Error fetching invoices:', error);
      setError(error);
      toast.error('Failed to fetch invoices');
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  const addInvoice = async (invoiceData: InvoiceInsert) => {
    if (!user) {
      toast.error('You must be logged in to add invoices');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('invoices')
        .insert({ ...invoiceData, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      
      const newInvoice = { ...data, invoice_line_items: [], customers: null };
      setInvoices(prev => [newInvoice, ...prev]);
      toast.success('Invoice added successfully');
      
      await supabase.from('activity_logs').insert({
        user_id: user.id,
        entity_type: 'invoice',
        entity_id: data.id,
        action: 'created',
        description: `Invoice created: ${data.invoice_number}`
      });

      return data;
    } catch (error: any) {
      console.error('Error adding invoice:', error);
      toast.error(error.message || 'Failed to add invoice');
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
      
      setInvoices(prev => prev.map(invoice => 
        invoice.id === id ? { ...invoice, ...data } : invoice
      ));
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
