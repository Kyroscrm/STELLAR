import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { InvoiceFormData, InvoiceStatus, ApiError } from '@/types/app-types';
import { useErrorHandler } from './useErrorHandler';
import { useOptimisticUpdate } from './useOptimisticUpdate';
import { enforcePolicy, SecurityError, handleSupabaseError } from '@/lib/security';

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

export type PaymentStatus = 'completed' | 'failed' | 'pending' | 'refunded';

export interface InvoiceLineItemData {
  description: string;
  quantity: number;
  unit_price: number;
}

export interface InvoiceLineItemFormData {
  description: string;
  quantity: number;
  unit_price: number;
  total?: number;
  sort_order?: number;
}

interface UseInvoicesReturn {
  invoices: InvoiceWithCustomer[];
  loading: boolean;
  error: Error | null;
  fetchInvoices: () => Promise<void>;
  addInvoice: (invoiceData: InvoiceFormData) => Promise<InvoiceWithCustomer | null>;
  updateInvoice: (id: string, updates: InvoiceUpdate) => Promise<boolean>;
  deleteInvoice: (id: string) => Promise<boolean>;
}

export const useInvoices = (): UseInvoicesReturn => {
  const [invoices, setInvoices] = useState<InvoiceWithCustomer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { user, session } = useAuth();
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

  const fetchInvoices = async (): Promise<void> => {
    if (!validateUserAndSession()) return;

    setLoading(true);
    setError(null);
    try {
      const data = await enforcePolicy('invoices:read', async () => {
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
        return data || [];
      });

      setInvoices(data);
    } catch (error: unknown) {
      if (error instanceof SecurityError) {
        setError(error);
        handleError(error, { title: 'Access Denied: You do not have permission to view invoices.' });
      } else {
        const processedError = handleSupabaseError(error);
        setError(processedError);
        handleError(processedError, { title: 'Failed to fetch invoices' });
      }
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  const addInvoice = async (invoiceData: InvoiceFormData): Promise<InvoiceWithCustomer | null> => {
    if (!validateUserAndSession()) return null;

    setError(null);
    try {
      const { line_items, ...invoiceFields } = invoiceData;

      // Clean up UUID fields - convert empty strings to undefined
      const cleanedInvoiceFields = {
        ...invoiceFields,
        customer_id: invoiceFields.customer_id && invoiceFields.customer_id.trim() !== '' ? invoiceFields.customer_id : undefined,
        job_id: invoiceFields.job_id && invoiceFields.job_id.trim() !== '' ? invoiceFields.job_id : undefined,
        estimate_id: invoiceFields.estimate_id && invoiceFields.estimate_id.trim() !== '' ? invoiceFields.estimate_id : undefined,
        // Ensure payment_status uses proper enum values, default to 'pending'
        payment_status: (invoiceFields.payment_status as PaymentStatus) || 'pending',
        // Ensure status uses proper enum values, default to 'draft'
        status: (invoiceFields.status as InvoiceStatus) || 'draft',
        user_id: user.id
      };

      // Remove undefined fields to prevent sending them to Supabase
      Object.keys(cleanedInvoiceFields).forEach(key => {
        if (cleanedInvoiceFields[key as keyof typeof cleanedInvoiceFields] === undefined) {
          delete cleanedInvoiceFields[key as keyof typeof cleanedInvoiceFields];
        }
      });

      // Create optimistic invoice
      const optimisticInvoice: InvoiceWithCustomer = {
        id: `temp-${Date.now()}`,
        ...cleanedInvoiceFields,
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        // Add missing required properties with default values
        paid_at: null,
        stripe_session_id: null,
        subtotal: line_items?.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0) || 0,
        tax_amount: 0,
        total_amount: line_items?.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0) || 0,
        invoice_line_items: line_items?.map((item, index) => ({
          id: `temp-${Date.now()}-${index}`,
          invoice_id: `temp-${Date.now()}`,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total: item.quantity * item.unit_price,
          sort_order: item.sort_order || index,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })) || []
      } as unknown as InvoiceWithCustomer; // Use type assertion to handle any remaining type issues

      return await executeUpdate(
        // Optimistic update
        () => setInvoices(prev => [optimisticInvoice, ...prev]),
        // Actual update
        async () => {
          const invoice = await enforcePolicy('invoices:create', async () => {
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

            if (line_items && line_items.length > 0) {
              const lineItemsToInsert = line_items.map(item => ({
                invoice_id: invoice.id,
                description: item.description,
                quantity: item.quantity,
                unit_price: item.unit_price,
                sort_order: item.sort_order
                // Remove total - let the database trigger calculate it
              }));

              const { error: lineItemsError } = await supabase
                .from('invoice_line_items')
                .insert(lineItemsToInsert);

              if (lineItemsError) throw lineItemsError;

              // Fetch the complete invoice with line items after inserting them
              const { data: completeInvoice, error: fetchError } = await supabase
                .from('invoices')
                .select(`
                  *,
                  invoice_line_items(*),
                  customers(id, first_name, last_name, email, phone)
                `)
                .eq('id', invoice.id)
                .single();

              if (fetchError) throw fetchError;
              return completeInvoice;
            }

            // Log activity
            await supabase.from('activity_logs').insert({
              user_id: user.id,
              entity_type: 'invoice',
              entity_id: invoice.id,
              action: 'created',
              description: `Invoice created: ${invoice.title}`
            });

            return invoice;
          });

          // CRITICAL FIX: Replace the optimistic invoice with real data
          setInvoices(prev => {
            // Remove the temporary invoice and add the real one at the beginning
            const filtered = prev.filter(i => i.id !== optimisticInvoice.id);
            return [invoice, ...filtered];
          });

          return invoice;
        },
        // Rollback
        () => setInvoices(prev => prev.filter(i => i.id !== optimisticInvoice.id)),
        {
          successMessage: 'Invoice created successfully',
          errorMessage: 'Failed to create invoice'
        }
      );
    } catch (error: unknown) {
      if (error instanceof SecurityError) {
        handleError(error, { title: 'Access Denied: You do not have permission to create invoices.' });
      } else {
        const processedError = handleSupabaseError(error);
        setError(processedError);
        handleError(processedError, { title: 'Failed to create invoice' });
      }
      return null;
    }
  };

  const updateInvoice = async (id: string, updates: InvoiceUpdate): Promise<boolean> => {
    if (!validateUserAndSession()) return false;

    // Find the original invoice for optimistic updates and rollback
    const originalInvoice = invoices.find(invoice => invoice.id === id);
    if (!originalInvoice) {
      handleError(new Error('Invoice not found'), { title: 'Update Failed' });
      return false;
    }

    // Create optimistic update
    const optimisticInvoice = { ...originalInvoice, ...updates, updated_at: new Date().toISOString() };

    try {
      return await executeUpdate(
        // Optimistic update
        () => setInvoices(prev => prev.map(invoice => invoice.id === id ? optimisticInvoice : invoice)),
        // Actual update
        async () => {
          const data = await enforcePolicy('invoices:update', async () => {
            // Clean up UUID fields in updates as well
            const cleanedUpdates = { ...updates };
            if (cleanedUpdates.customer_id === '') cleanedUpdates.customer_id = undefined;
            if (cleanedUpdates.job_id === '') cleanedUpdates.job_id = undefined;
            if (cleanedUpdates.estimate_id === '') cleanedUpdates.estimate_id = undefined;

            // Ensure payment_status uses valid enum values if being updated
            if (cleanedUpdates.payment_status && !['completed', 'failed', 'pending', 'refunded'].includes(cleanedUpdates.payment_status as PaymentStatus)) {
              delete cleanedUpdates.payment_status;
            }

            // Ensure status uses valid enum values if being updated
            if (cleanedUpdates.status && !['draft', 'sent', 'paid', 'overdue', 'cancelled', 'viewed'].includes(cleanedUpdates.status as InvoiceStatus)) {
              delete cleanedUpdates.status;
            }

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

            // Log activity
            await supabase.from('activity_logs').insert({
              user_id: user.id,
              entity_type: 'invoice',
              entity_id: id,
              action: 'updated',
              description: `Invoice updated: ${data.title}`
            });

            return data;
          });

          // Update with real data
          setInvoices(prev => prev.map(invoice => invoice.id === id ? data : invoice));
          return true;
        },
        // Rollback
        () => setInvoices(prev => prev.map(invoice => invoice.id === id ? originalInvoice : invoice)),
        {
          successMessage: 'Invoice updated successfully',
          errorMessage: 'Failed to update invoice'
        }
      );
    } catch (error: unknown) {
      if (error instanceof SecurityError) {
        handleError(error, { title: 'Access Denied: You do not have permission to update invoices.' });
      } else {
        handleError(handleSupabaseError(error), { title: 'Failed to update invoice' });
      }
      return false;
    }
  };

  const deleteInvoice = async (id: string): Promise<boolean> => {
    if (!validateUserAndSession()) return false;

    // Store original for rollback
    const originalInvoice = invoices.find(invoice => invoice.id === id);
    if (!originalInvoice) {
      handleError(new Error('Invoice not found'), { title: 'Delete Failed' });
      return false;
    }

    try {
      return await executeUpdate(
        // Optimistic update
        () => setInvoices(prev => prev.filter(invoice => invoice.id !== id)),
        // Actual update
        async () => {
          await enforcePolicy('invoices:delete', async () => {
            // First delete line items to avoid foreign key constraint errors
            const { error: lineItemsError } = await supabase
              .from('invoice_line_items')
              .delete()
              .eq('invoice_id', id);

            if (lineItemsError) throw lineItemsError;

            // Then delete the invoice
            const { error } = await supabase
              .from('invoices')
              .delete()
              .eq('id', id)
              .eq('user_id', user.id);

            if (error) throw error;

            // Log activity
            await supabase.from('activity_logs').insert({
              user_id: user.id,
              entity_type: 'invoice',
              entity_id: id,
              action: 'deleted',
              description: `Invoice deleted: ${originalInvoice.title}`
            });

            return true;
          });

          return true;
        },
        // Rollback
        () => setInvoices(prev => [...prev, originalInvoice].sort((a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )),
        {
          successMessage: 'Invoice deleted successfully',
          errorMessage: 'Failed to delete invoice'
        }
      );
    } catch (error: unknown) {
      if (error instanceof SecurityError) {
        handleError(error, { title: 'Access Denied: You do not have permission to delete invoices.' });
      } else {
        handleError(handleSupabaseError(error), { title: 'Failed to delete invoice' });
      }
      return false;
    }
  };

  useEffect(() => {
    if (user && session) {
      fetchInvoices();
    }
  }, [user?.id]);

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
