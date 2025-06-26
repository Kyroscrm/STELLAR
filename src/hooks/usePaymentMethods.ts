import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import type { PaymentMethod } from '@/types/app-types';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

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

      // Transform the data to handle null values properly
      const transformedData: PaymentMethod[] = (data || []).map((item) => ({
        ...item,
        is_default: item.is_default ?? false, // Convert null to false
        metadata: (item.metadata as Record<string, any>) || {}
      }));

      setPaymentMethods(transformedData);
    } catch (error: unknown) {
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

      const transformedData: PaymentMethod = {
        ...data,
        is_default: data.is_default ?? false, // Convert null to false
        metadata: (data.metadata as Record<string, any>) || {}
      };

      setPaymentMethods(prev => [transformedData, ...prev]);
      toast.success('Payment method added successfully');
      return transformedData;
    } catch (error: unknown) {
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

      const transformedData: PaymentMethod = {
        ...data,
        is_default: data.is_default ?? false, // Convert null to false
        metadata: (data.metadata as Record<string, any>) || {}
      };

      setPaymentMethods(prev => prev.map(method => method.id === id ? transformedData : method));
      toast.success('Payment method updated successfully');
      return transformedData;
    } catch (error: unknown) {
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
    } catch (error: unknown) {
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
