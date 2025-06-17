
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface StripeCheckoutOptions {
  invoiceId: string;
}

export async function createStripeCheckoutSession(options: StripeCheckoutOptions): Promise<string | null> {
  try {
    console.log('Creating Stripe checkout session for invoice:', options.invoiceId);
    
    const { data, error } = await supabase.functions.invoke('create-stripe-checkout', {
      body: { invoiceId: options.invoiceId }
    });

    if (error) {
      console.error('Stripe checkout error:', error);
      throw new Error(error.message || 'Failed to create payment session');
    }

    if (!data?.url) {
      throw new Error('No checkout URL received from Stripe');
    }

    console.log('Stripe checkout session created successfully');
    return data.url;
  } catch (error) {
    console.error('Error creating Stripe checkout session:', error);
    const errorMessage = error instanceof Error ? error.message : 'Payment session could not be created';
    toast.error(errorMessage);
    return null;
  }
}

export function getPaymentStatusBadgeVariant(paymentStatus: string) {
  switch (paymentStatus) {
    case 'paid':
      return 'default';
    case 'pending':
      return 'secondary';
    case 'failed':
      return 'destructive';
    case 'unpaid':
    default:
      return 'outline';
  }
}

export function getPaymentStatusLabel(paymentStatus: string) {
  switch (paymentStatus) {
    case 'paid':
      return 'Paid';
    case 'pending':
      return 'Payment Pending';
    case 'failed':
      return 'Payment Failed';
    case 'unpaid':
    default:
      return 'Unpaid';
  }
}
