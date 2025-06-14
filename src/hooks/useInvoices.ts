
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { Database } from '@/integrations/supabase/types';
import { Customer } from '@/hooks/useCustomers';

export type Invoice = Database['public']['Tables']['invoices']['Row'];
export type InvoiceLineItem = Database['public']['Tables']['invoice_line_items']['Row'];

export interface InvoiceWithLineItems extends Invoice {
  invoice_line_items: InvoiceLineItem[];
  customers?: Customer | null;
}

export const useInvoices = () => {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<InvoiceWithLineItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchInvoices = async () => {
      if (!user) {
        setInvoices([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { data, error: supabaseError } = await supabase
          .from('invoices')
          .select(`
            *,
            customers (
              id,
              first_name,
              last_name,
              email,
              phone
            ),
            invoice_line_items ( * )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (supabaseError) {
          throw supabaseError;
        }

        setInvoices(data as InvoiceWithLineItems[] || []);
      } catch (err: any) {
        console.error('Error fetching invoices:', err);
        setError(err);
        toast({
          title: "Error fetching invoices",
          description: err.message || "Could not retrieve invoices from the server.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, [user]);

  // Placeholder CRUD functions
  const addInvoice = async (newInvoiceData: Omit<Invoice, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    console.log('Adding invoice:', newInvoiceData);
    toast({ title: "Invoice added (mock)" });
    // Update: No return value needed
  };

  const updateInvoice = async (invoiceId: string, updatedInvoiceData: Partial<Invoice>) => {
    console.log('Updating invoice:', invoiceId, updatedInvoiceData);
    toast({ title: "Invoice updated (mock)" });
  };

  const deleteInvoice = async (invoiceId: string) => {
    console.log('Deleting invoice:', invoiceId);
    toast({ title: "Invoice deleted (mock)", variant: "destructive" });
  };

  return { invoices, loading, error, addInvoice, updateInvoice, deleteInvoice };
};
