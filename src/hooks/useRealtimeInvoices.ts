
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const useRealtimeInvoices = (onInvoiceUpdate?: (invoice: any) => void) => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('invoice-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'invoices',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Real-time invoice update:', payload);
          
          const updatedInvoice = payload.new;
          
          // Show toast notification for payment status changes
          if (updatedInvoice.payment_status === 'paid' && payload.old.payment_status !== 'paid') {
            toast.success(`Payment received for Invoice ${updatedInvoice.invoice_number}!`);
          }
          
          // Call callback if provided
          if (onInvoiceUpdate) {
            onInvoiceUpdate(updatedInvoice);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, onInvoiceUpdate]);
};
