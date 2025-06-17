
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useActivityLogs } from '@/hooks/useActivityLogs';
import { toast } from 'sonner';

export interface Customer {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  company_name?: string;
  notes?: string;
  lead_id?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  created_at: string;
  updated_at: string;
}

export const useCustomers = () => {
  const { user } = useAuth();
  const { logActivity } = useActivityLogs();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCustomers = async () => {
    if (!user) return;

    setLoading(true);
    try {
      console.log('Fetching customers for user:', user.id);
      
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setCustomers(data || []);
      console.log(`Successfully fetched ${data?.length || 0} customers`);
    } catch (error: any) {
      console.error('Error fetching customers:', error);
      toast.error('Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  };

  const createCustomer = async (customerData: Omit<Customer, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) {
      toast.error('Authentication required');
      return null;
    }

    // Optimistic update
    const tempCustomer: Customer = {
      ...customerData,
      id: `temp-${Date.now()}`,
      user_id: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setCustomers(prev => [tempCustomer, ...prev]);

    try {
      console.log('Creating customer:', customerData);
      
      const { data, error } = await supabase
        .from('customers')
        .insert({
          ...customerData,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      // Replace optimistic update with real data
      setCustomers(prev => prev.map(c => c.id === tempCustomer.id ? data : c));
      
      await logActivity('create', 'customer', data.id, `Created customer: ${data.first_name} ${data.last_name}`);
      toast.success('Customer created successfully');
      return data;
    } catch (error: any) {
      console.error('Error creating customer:', error);
      // Rollback optimistic update
      setCustomers(prev => prev.filter(c => c.id !== tempCustomer.id));
      toast.error('Failed to create customer');
      return null;
    }
  };

  const updateCustomer = async (id: string, updates: Partial<Omit<Customer, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => {
    if (!user) {
      toast.error('Authentication required');
      return false;
    }

    // Optimistic update
    const optimisticCustomer = customers.find(c => c.id === id);
    if (optimisticCustomer) {
      setCustomers(prev => prev.map(c => 
        c.id === id ? { ...c, ...updates, updated_at: new Date().toISOString() } : c
      ));
    }

    try {
      console.log('Updating customer:', id, updates);
      
      const { data, error } = await supabase
        .from('customers')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      
      // Update with real data
      setCustomers(prev => prev.map(c => c.id === id ? data : c));
      
      await logActivity('update', 'customer', id, `Updated customer: ${data.first_name} ${data.last_name}`);
      toast.success('Customer updated successfully');
      return true;
    } catch (error: any) {
      console.error('Error updating customer:', error);
      // Rollback optimistic update
      if (optimisticCustomer) {
        setCustomers(prev => prev.map(c => c.id === id ? optimisticCustomer : c));
      }
      toast.error('Failed to update customer');
      return false;
    }
  };

  const deleteCustomer = async (id: string) => {
    if (!user) {
      toast.error('Authentication required');
      return false;
    }

    // Optimistic update
    const customerToDelete = customers.find(c => c.id === id);
    setCustomers(prev => prev.filter(c => c.id !== id));

    try {
      console.log('Deleting customer:', id);
      
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      
      await logActivity('delete', 'customer', id, `Deleted customer: ${customerToDelete?.first_name} ${customerToDelete?.last_name}`);
      toast.success('Customer deleted successfully');
      return true;
    } catch (error: any) {
      console.error('Error deleting customer:', error);
      // Rollback optimistic update
      if (customerToDelete) {
        setCustomers(prev => [...prev, customerToDelete].sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        ));
      }
      toast.error('Failed to delete customer');
      return false;
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [user]);

  return {
    customers,
    loading,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    fetchCustomers
  };
};
