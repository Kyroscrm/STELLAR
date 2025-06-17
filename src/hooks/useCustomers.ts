
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export type Customer = Tables<'customers'>;
type CustomerInsert = Omit<TablesInsert<'customers'>, 'user_id'>;
type CustomerUpdate = TablesUpdate<'customers'>;

export const useCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { user, session } = useAuth();

  const validateUserAndSession = () => {
    if (!user || !session) {
      const errorMsg = 'Authentication required. Please log in again.';
      setError(new Error(errorMsg));
      toast.error(errorMsg);
      return false;
    }
    return true;
  };

  const fetchCustomers = async () => {
    if (!validateUserAndSession()) return;
    
    setLoading(true);
    setError(null);
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
      setError(error);
      toast.error('Failed to fetch customers');
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const createCustomer = async (customerData: CustomerInsert) => {
    if (!validateUserAndSession()) return null;

    const optimisticCustomer: Customer = {
      id: `temp-${Date.now()}`,
      ...customerData,
      user_id: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    } as Customer;

    // Optimistic update
    setCustomers(prev => [optimisticCustomer, ...prev]);

    try {
      console.log('Creating customer:', customerData);
      
      const { data, error } = await supabase
        .from('customers')
        .insert({ ...customerData, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      
      // Replace optimistic with real data
      setCustomers(prev => prev.map(c => c.id === optimisticCustomer.id ? data : c));
      
      // Log activity
      await supabase.from('activity_logs').insert({
        user_id: user.id,
        entity_type: 'customer',
        entity_id: data.id,
        action: 'created',
        description: `Customer created: ${data.first_name} ${data.last_name}`
      });

      toast.success('Customer created successfully');
      console.log('Customer created successfully:', data);
      return data;
    } catch (error: any) {
      console.error('Error creating customer:', error);
      // Rollback optimistic update
      setCustomers(prev => prev.filter(c => c.id !== optimisticCustomer.id));
      toast.error(error.message || 'Failed to create customer');
      return null;
    }
  };

  const updateCustomer = async (id: string, updates: CustomerUpdate) => {
    if (!validateUserAndSession()) return false;

    // Store original for rollback
    const originalCustomer = customers.find(c => c.id === id);
    if (!originalCustomer) {
      toast.error('Customer not found');
      return false;
    }

    // Optimistic update
    const optimisticCustomer = { ...originalCustomer, ...updates, updated_at: new Date().toISOString() };
    setCustomers(prev => prev.map(c => c.id === id ? optimisticCustomer : c));

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
      
      // Log activity
      await supabase.from('activity_logs').insert({
        user_id: user.id,
        entity_type: 'customer',
        entity_id: id,
        action: 'updated',
        description: `Customer updated: ${data.first_name} ${data.last_name}`
      });

      toast.success('Customer updated successfully');
      console.log('Customer updated successfully:', data);
      return true;
    } catch (error: any) {
      console.error('Error updating customer:', error);
      // Rollback optimistic update
      setCustomers(prev => prev.map(c => c.id === id ? originalCustomer : c));
      toast.error(error.message || 'Failed to update customer');
      return false;
    }
  };

  const deleteCustomer = async (id: string) => {
    if (!validateUserAndSession()) return;

    // Store original for rollback
    const originalCustomer = customers.find(c => c.id === id);
    if (!originalCustomer) {
      toast.error('Customer not found');
      return;
    }

    // Optimistic update
    setCustomers(prev => prev.filter(c => c.id !== id));

    try {
      console.log('Deleting customer:', id);
      
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      
      // Log activity
      await supabase.from('activity_logs').insert({
        user_id: user.id,
        entity_type: 'customer',
        entity_id: id,
        action: 'deleted',
        description: `Customer deleted: ${originalCustomer.first_name} ${originalCustomer.last_name}`
      });

      toast.success('Customer deleted successfully');
      console.log('Customer deleted successfully');
    } catch (error: any) {
      console.error('Error deleting customer:', error);
      // Rollback optimistic update
      setCustomers(prev => [...prev, originalCustomer].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ));
      toast.error(error.message || 'Failed to delete customer');
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [user, session]);

  return {
    customers,
    loading,
    error,
    fetchCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer
  };
};
