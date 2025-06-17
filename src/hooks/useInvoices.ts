
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useActivityLogs } from '@/hooks/useActivityLogs';
import { toast } from 'sonner';

export interface Invoice {
  id: string;
  user_id: string;
  customer_id?: string;
  job_id?: string;
  estimate_id?: string;
  invoice_number: string;
  title: string;
  description?: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total_amount: number;
  due_date?: string;
  payment_terms?: string;
  payment_status: string;
  stripe_session_id?: string;
  paid_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export const useInvoices = () => {
  const { user } = useAuth();
  const { logActivity } = useActivityLogs();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchInvoices = async () => {
    if (!user) return;

    setLoading(true);
    try {
      console.log('Fetching invoices for user:', user.id);
      
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setInvoices(data || []);
      console.log(`Successfully fetched ${data?.length || 0} invoices`);
    } catch (error: any) {
      console.error('Error fetching invoices:', error);
      toast.error('Failed to fetch invoices');
    } finally {
      setLoading(false);
    }
  };

  const createInvoice = async (invoiceData: Omit<Invoice, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) {
      toast.error('Authentication required');
      return null;
    }

    // Optimistic update
    const tempInvoice: Invoice = {
      ...invoiceData,
      id: `temp-${Date.now()}`,
      user_id: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setInvoices(prev => [tempInvoice, ...prev]);

    try {
      console.log('Creating invoice:', invoiceData);
      
      const { data, error } = await supabase
        .from('invoices')
        .insert({
          ...invoiceData,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      // Replace optimistic update with real data
      setInvoices(prev => prev.map(i => i.id === tempInvoice.id ? data : i));
      
      await logActivity('create', 'invoice', data.id, `Created invoice: ${data.invoice_number}`);
      toast.success('Invoice created successfully');
      return data;
    } catch (error: any) {
      console.error('Error creating invoice:', error);
      // Rollback optimistic update
      setInvoices(prev => prev.filter(i => i.id !== tempInvoice.id));
      toast.error('Failed to create invoice');
      return null;
    }
  };

  const updateInvoice = async (id: string, updates: Partial<Omit<Invoice, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => {
    if (!user) {
      toast.error('Authentication required');
      return false;
    }

    // Optimistic update
    const optimisticInvoice = invoices.find(i => i.id === id);
    if (optimisticInvoice) {
      setInvoices(prev => prev.map(i => 
        i.id === id ? { ...i, ...updates, updated_at: new Date().toISOString() } : i
      ));
    }

    try {
      console.log('Updating invoice:', id, updates);
      
      const { data, error } = await supabase
        .from('invoices')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      
      // Update with real data
      setInvoices(prev => prev.map(i => i.id === id ? data : i));
      
      await logActivity('update', 'invoice', id, `Updated invoice: ${data.invoice_number}`);
      toast.success('Invoice updated successfully');
      return true;
    } catch (error: any) {
      console.error('Error updating invoice:', error);
      // Rollback optimistic update
      if (optimisticInvoice) {
        setInvoices(prev => prev.map(i => i.id === id ? optimisticInvoice : i));
      }
      toast.error('Failed to update invoice');
      return false;
    }
  };

  const deleteInvoice = async (id: string) => {
    if (!user) {
      toast.error('Authentication required');
      return false;
    }

    // Optimistic update
    const invoiceToDelete = invoices.find(i => i.id === id);
    setInvoices(prev => prev.filter(i => i.id !== id));

    try {
      console.log('Deleting invoice:', id);
      
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      
      await logActivity('delete', 'invoice', id, `Deleted invoice: ${invoiceToDelete?.invoice_number}`);
      toast.success('Invoice deleted successfully');
      return true;
    } catch (error: any) {
      console.error('Error deleting invoice:', error);
      // Rollback optimistic update
      if (invoiceToDelete) {
        setInvoices(prev => [...prev, invoiceToDelete].sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        ));
      }
      toast.error('Failed to delete invoice');
      return false;
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [user]);

  return {
    invoices,
    loading,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    fetchInvoices
  };
};
