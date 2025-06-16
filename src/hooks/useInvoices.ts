
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export type Invoice = Tables<'invoices'>;
type InvoiceInsert = Omit<TablesInsert<'invoices'>, 'user_id'>;
type InvoiceUpdate = TablesUpdate<'invoices'>;

// Extended Invoice type with customer data
export type InvoiceWithCustomer = Invoice & {
  customers?: {
    id: string;
    first_name: string;
    last_name: string;
    email?: string;
    phone?: string;
  };
};

// Extended Invoice type with line items
export type InvoiceWithLineItems = Invoice & {
  invoice_line_items?: {
    id: string;
    description: string;
    quantity: number;
    unit_price: number;
    total: number;
  }[];
};

export const useInvoices = () => {
  const [invoices, setInvoices] = useState<InvoiceWithCustomer[]>([]);
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

  const createInvoice = async (invoiceData: InvoiceInsert) => {
    if (!user) {
      toast.error('You must be logged in to create invoices');
      return null;
    }

    // Validate UUID fields - don't submit empty strings
    const cleanedData = { ...invoiceData };
    if (!cleanedData.customer_id || cleanedData.customer_id.trim() === '') {
      toast.error('Please select a customer');
      return null;
    }
    if (cleanedData.job_id && cleanedData.job_id.trim() === '') {
      delete cleanedData.job_id;
    }
    if (cleanedData.estimate_id && cleanedData.estimate_id.trim() === '') {
      delete cleanedData.estimate_id;
    }

    try {
      const { data, error } = await supabase
        .from('invoices')
        .insert({ ...cleanedData, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      
      setInvoices(prev => [data, ...prev]);
      toast.success('Invoice created successfully');
      
      // Log activity
      await supabase.from('activity_logs').insert({
        user_id: user.id,
        entity_type: 'invoice',
        entity_id: data.id,
        action: 'created',
        description: `Invoice created: ${data.title}`,
        metadata: { invoice_number: data.invoice_number }
      });

      return data;
    } catch (error: any) {
      console.error('Error creating invoice:', error);
      toast.error(error.message || 'Failed to create invoice');
      return null;
    }
  };

  const addInvoice = createInvoice; // Alias for compatibility

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
      
      setInvoices(prev => prev.map(invoice => invoice.id === id ? data : invoice));
      toast.success('Invoice updated successfully');
      
      // Log activity
      await supabase.from('activity_logs').insert({
        user_id: user.id,
        entity_type: 'invoice',
        entity_id: id,
        action: 'updated',
        description: `Invoice updated`,
        metadata: { updates: Object.keys(updates) }
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
      
      // Log activity
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
    createInvoice,
    addInvoice,
    updateInvoice,
    deleteInvoice
  };
};
