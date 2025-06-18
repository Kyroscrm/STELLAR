import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export type Invoice = Tables<'invoices'>;
export type InvoiceLineItem = Tables<'invoice_line_items'>;

// Extended Invoice type with customer data
export type InvoiceWithCustomer = Invoice & {
  invoice_line_items: InvoiceLineItem[];
  customers?: { 
    id: string;
    first_name: string; 
    last_name: string;
    email?: string;
    phone?: string;
  };
};

type InvoiceInsert = Omit<TablesInsert<'invoices'>, 'user_id'>;
type InvoiceUpdate = TablesUpdate<'invoices'>;

export type InvoiceFormData = Omit<InvoiceInsert, 'user_id'> & {
  customer_id?: string;
  job_id?: string;
  estimate_id?: string;
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
          invoice_line_items(*),
          customers(id, first_name, last_name, email, phone)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvoices(data || []);
      console.log(`Fetched ${data?.length || 0} invoices with customer data`);
    } catch (error: any) {
      console.error('Error fetching invoices:', error);
      setError(error);
      toast.error('Failed to fetch invoices');
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  const addInvoice = async (invoiceData: InvoiceFormData & { lineItems: any[] }) => {
    if (!user) {
      toast.error('You must be logged in to create invoices');
      return null;
    }

    setError(null);
    try {
      const { lineItems, ...invoiceFields } = invoiceData;
      
      // Clean up UUID fields - convert empty strings to undefined
      const cleanedInvoiceFields = {
        ...invoiceFields,
        customer_id: invoiceFields.customer_id && invoiceFields.customer_id.trim() !== '' ? invoiceFields.customer_id : undefined,
        job_id: invoiceFields.job_id && invoiceFields.job_id.trim() !== '' ? invoiceFields.job_id : undefined,
        estimate_id: invoiceFields.estimate_id && invoiceFields.estimate_id.trim() !== '' ? invoiceFields.estimate_id : undefined,
        user_id: user.id
      };

      // Remove undefined fields to prevent sending them to Supabase
      Object.keys(cleanedInvoiceFields).forEach(key => {
        if (cleanedInvoiceFields[key as keyof typeof cleanedInvoiceFields] === undefined) {
          delete cleanedInvoiceFields[key as keyof typeof cleanedInvoiceFields];
        }
      });
      
      console.log('Creating invoice with cleaned data:', cleanedInvoiceFields);
      
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert(cleanedInvoiceFields)
        .select(`
          *,
          invoice_line_items(*),
          customers(id, first_name, last_name, email, phone)
        `)
        .single();

      if (invoiceError) throw invoiceError;

      if (lineItems && lineItems.length > 0) {
        const lineItemsToInsert = lineItems.map(item => ({
          invoice_id: invoice.id,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price
          // Remove total - let the database trigger calculate it
        }));

        console.log('Inserting line items:', lineItemsToInsert);

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
      setError(error);
      toast.error(error.message || 'Failed to create invoice');
      return null;
    }
  };

  const updateInvoice = async (id: string, updates: InvoiceUpdate) => {
    if (!user) {
      toast.error('You must be logged in to update invoices');
      return false;
    }

    setError(null);
    try {
      // Clean up UUID fields in updates as well
      const cleanedUpdates = { ...updates };
      if (cleanedUpdates.customer_id === '') cleanedUpdates.customer_id = undefined;
      if (cleanedUpdates.job_id === '') cleanedUpdates.job_id = undefined;
      if (cleanedUpdates.estimate_id === '') cleanedUpdates.estimate_id = undefined;

      // Remove undefined fields
      Object.keys(cleanedUpdates).forEach(key => {
        if (cleanedUpdates[key as keyof typeof cleanedUpdates] === undefined) {
          delete cleanedUpdates[key as keyof typeof cleanedUpdates];
        }
      });

      const { data, error } = await supabase
        .from('invoices')
        .update(cleanedUpdates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select(`
          *,
          invoice_line_items(*),
          customers(id, first_name, last_name, email, phone)
        `)
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
      setError(error);
      toast.error(error.message || 'Failed to update invoice');
      return false;
    }
  };

  const deleteInvoice = async (id: string) => {
    if (!user) {
      toast.error('You must be logged in to delete invoices');
      return;
    }

    setError(null);
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
      setError(error);
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
