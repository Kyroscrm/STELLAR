
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface PaymentMethod {
  id: string;
  user_id: string;
  type: 'stripe' | 'paypal' | 'ach' | 'credit_card';
  provider_id: string | null;
  is_default: boolean;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export const usePaymentMethods = () => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchPaymentMethods = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPaymentMethods(data || []);
    } catch (error: any) {
      console.error('Error fetching payment methods:', error);
      toast.error('Failed to fetch payment methods');
    } finally {
      setLoading(false);
    }
  };

  const createPaymentMethod = async (methodData: Omit<PaymentMethod, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('payment_methods')
        .insert({ ...methodData, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      
      setPaymentMethods(prev => [data, ...prev]);
      toast.success('Payment method added successfully');
      return data;
    } catch (error: any) {
      console.error('Error creating payment method:', error);
      toast.error('Failed to add payment method');
      return null;
    }
  };

  const updatePaymentMethod = async (id: string, updates: Partial<PaymentMethod>) => {
    try {
      const { data, error } = await supabase
        .from('payment_methods')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setPaymentMethods(prev => prev.map(method => method.id === id ? data : method));
      toast.success('Payment method updated successfully');
      return data;
    } catch (error: any) {
      console.error('Error updating payment method:', error);
      toast.error('Failed to update payment method');
      return null;
    }
  };

  const deletePaymentMethod = async (id: string) => {
    try {
      const { error } = await supabase
        .from('payment_methods')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setPaymentMethods(prev => prev.filter(method => method.id !== id));
      toast.success('Payment method deleted successfully');
    } catch (error: any) {
      console.error('Error deleting payment method:', error);
      toast.error('Failed to delete payment method');
    }
  };

  useEffect(() => {
    fetchPaymentMethods();
  }, [user]);

  return {
    paymentMethods,
    loading,
    fetchPaymentMethods,
    createPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod
  };
};
