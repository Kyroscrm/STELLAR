
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export type Customer = Tables<'customers'>;
type CustomerInsert = TablesInsert<'customers'>;
type CustomerUpdate = TablesUpdate<'customers'>;

export const useCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const { user, session } = useAuth();

  const fetchCustomers = async () => {
    if (!user || !session) {
      console.log('No user or session available for fetching customers');
      return;
    }
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching customers:', error);
        throw error;
      }
      
      console.log(`Fetched ${data?.length || 0} customers`);
      setCustomers(data || []);
    } catch (error: any) {
      console.error('Error fetching customers:', error);
      toast.error('Failed to fetch customers');
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const createCustomer = async (customerData: Omit<CustomerInsert, 'user_id'>) => {
    if (!user || !session) {
      toast.error('You must be logged in to create customers');
      return null;
    }

    try {
      console.log('Creating customer:', customerData);
      
      const { data, error } = await supabase
        .from('customers')
        .insert({ ...customerData, user_id: user.id })
        .select()
        .single();

      if (error) {
        console.error('Error creating customer:', error);
        throw error;
      }
      
      console.log('Customer created successfully:', data);
      setCustomers(prev => [data, ...prev]);
      toast.success('Customer created successfully');
      
      // Log activity
      await supabase.from('activity_logs').insert({
        user_id: user.id,
        entity_type: 'customer',
        entity_id: data.id,
        action: 'created',
        description: `Customer created for ${data.first_name} ${data.last_name}`
      });

      return data;
    } catch (error: any) {
      console.error('Error creating customer:', error);
      toast.error(error.message || 'Failed to create customer');
      return null;
    }
  };

  const updateCustomer = async (id: string, updates: CustomerUpdate) => {
    if (!user || !session) {
      toast.error('You must be logged in to update customers');
      return null;
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

      if (error) {
        console.error('Error updating customer:', error);
        throw error;
      }
      
      console.log('Customer updated successfully:', data);
      setCustomers(prev => prev.map(customer => customer.id === id ? data : customer));
      toast.success('Customer updated successfully');
      
      // Log activity
      await supabase.from('activity_logs').insert({
        user_id: user.id,
        entity_type: 'customer',
        entity_id: id,
        action: 'updated',
        description: `Customer updated`
      });

      return data;
    } catch (error: any) {
      console.error('Error updating customer:', error);
      toast.error(error.message || 'Failed to update customer');
      return null;
    }
  };

  const deleteCustomer = async (id: string) => {
    if (!user || !session) {
      toast.error('You must be logged in to delete customers');
      return;
    }

    try {
      console.log('Deleting customer:', id);
      
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting customer:', error);
        throw error;
      }
      
      console.log('Customer deleted successfully');
      setCustomers(prev => prev.filter(customer => customer.id !== id));
      toast.success('Customer deleted successfully');
      
      // Log activity
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
    if (user && session) {
      fetchCustomers();
    }
  }, [user, session]);

  return {
    customers,
    loading,
    fetchCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer
  };
};
