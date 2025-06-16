
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
  const { user } = useAuth();

  const fetchCustomers = async () => {
    if (!user) {
      setCustomers([]);
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCustomers(data || []);
      console.log(`Fetched ${data?.length || 0} customers`);
    } catch (error: any) {
      console.error('Error fetching customers:', error);
      setError(error);
      toast.error('Failed to fetch customers');
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const addCustomer = async (customerData: CustomerInsert) => {
    if (!user) {
      toast.error('You must be logged in to add customers');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('customers')
        .insert({ ...customerData, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      
      setCustomers(prev => [data, ...prev]);
      toast.success('Customer added successfully');
      
      await supabase.from('activity_logs').insert({
        user_id: user.id,
        entity_type: 'customer',
        entity_id: data.id,
        action: 'created',
        description: `Customer created: ${data.first_name} ${data.last_name}`
      });

      return data;
    } catch (error: any) {
      console.error('Error adding customer:', error);
      toast.error(error.message || 'Failed to add customer');
      return null;
    }
  };

  const createCustomer = addCustomer; // Alias for compatibility

  const updateCustomer = async (id: string, updates: CustomerUpdate) => {
    if (!user) {
      toast.error('You must be logged in to update customers');
      return false;
    }

    try {
      const { data, error } = await supabase
        .from('customers')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      
      setCustomers(prev => prev.map(customer => customer.id === id ? data : customer));
      toast.success('Customer updated successfully');
      
      await supabase.from('activity_logs').insert({
        user_id: user.id,
        entity_type: 'customer',
        entity_id: id,
        action: 'updated',
        description: `Customer updated`
      });

      return true;
    } catch (error: any) {
      console.error('Error updating customer:', error);
      toast.error(error.message || 'Failed to update customer');
      return false;
    }
  };

  const deleteCustomer = async (id: string) => {
    if (!user) {
      toast.error('You must be logged in to delete customers');
      return;
    }

    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      
      setCustomers(prev => prev.filter(customer => customer.id !== id));
      toast.success('Customer deleted successfully');
      
      await supabase.from('activity_logs').insert({
        user_id: user.id,
        entity_type: 'customer',
        entity_id: id,
        action: 'deleted',
        description: `Customer deleted`
      });
    } catch (error: any) {
      console.error('Error deleting customer:', error);
      toast.error(error.message || 'Failed to delete customer');
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [user]);

  return {
    customers,
    loading,
    error,
    fetchCustomers,
    addCustomer,
    createCustomer,
    updateCustomer,
    deleteCustomer
  };
};
