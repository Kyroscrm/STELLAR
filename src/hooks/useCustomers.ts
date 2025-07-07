import { useAuth } from '@/contexts/AuthContextExports';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { ApiError } from '@/types/app-types';
import { useErrorHandler } from './useErrorHandler';
import { useOptimisticUpdate } from './useOptimisticUpdate';
import { enforcePolicy, SecurityError, handleSupabaseError } from '@/lib/security';

export type Customer = Tables<'customers'>;
type CustomerInsert = Omit<TablesInsert<'customers'>, 'user_id'>;
type CustomerUpdate = TablesUpdate<'customers'>;

interface UseCustomersReturn {
  customers: Customer[];
  loading: boolean;
  error: Error | null;
  fetchCustomers: () => Promise<void>;
  createCustomer: (customerData: CustomerInsert) => Promise<Customer | null>;
  updateCustomer: (id: string, updates: CustomerUpdate) => Promise<boolean>;
  deleteCustomer: (id: string) => Promise<boolean>;
}

export const useCustomers = (): UseCustomersReturn => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { handleError } = useErrorHandler();
  const { executeUpdate } = useOptimisticUpdate();

  const fetchCustomers = useCallback(async (): Promise<void> => {
    if (!user) return;

    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setCustomers(data || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch customers'));
      toast.error('Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const createCustomer = async (customerData: CustomerInsert): Promise<Customer | null> => {
    if (!user) return null;

    const optimisticCustomer: Customer = {
      id: `temp-${Date.now()}`,
      ...customerData,
      user_id: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    } as Customer;

    try {
      return await executeUpdate(
        // Optimistic update
        () => setCustomers(prev => [optimisticCustomer, ...prev]),
        // Actual update
        async () => {
          const data = await enforcePolicy('customers:create', async () => {
            const { data, error } = await supabase
              .from('customers')
              .insert({ ...customerData, user_id: user.id })
              .select()
              .single();

            if (error) throw error;

            // Log activity
            await supabase.from('activity_logs').insert({
              user_id: user.id,
              entity_type: 'customer',
              entity_id: data.id,
              action: 'created',
              description: `Customer created: ${data.first_name} ${data.last_name}`
            });

            return data;
          });

          // Replace optimistic with real data
          setCustomers(prev => prev.map(c => c.id === optimisticCustomer.id ? data : c));
          return data;
        },
        // Rollback
        () => setCustomers(prev => prev.filter(c => c.id !== optimisticCustomer.id)),
        {
          successMessage: 'Customer created successfully',
          errorMessage: 'Failed to create customer'
        }
      );
    } catch (error: unknown) {
      if (error instanceof SecurityError) {
        handleError(error, { title: 'Access Denied: You do not have permission to create customers.' });
      }
      return null;
    }
  };

  const updateCustomer = async (id: string, updates: CustomerUpdate): Promise<boolean> => {
    if (!user) return false;

    // Store original for rollback
    const originalCustomer = customers.find(c => c.id === id);
    if (!originalCustomer) {
      handleError(new Error('Customer not found'), { title: 'Update Failed' });
      return false;
    }

    // Create optimistic update
    const optimisticCustomer = { ...originalCustomer, ...updates, updated_at: new Date().toISOString() };

    try {
      return await executeUpdate(
        // Optimistic update
        () => setCustomers(prev => prev.map(c => c.id === id ? optimisticCustomer : c)),
        // Actual update
        async () => {
          const data = await enforcePolicy('customers:update', async () => {
            const { data, error } = await supabase
              .from('customers')
              .update(updates)
              .eq('id', id)
              .eq('user_id', user.id)
              .select()
              .single();

            if (error) throw error;

            // Log activity
            await supabase.from('activity_logs').insert({
              user_id: user.id,
              entity_type: 'customer',
              entity_id: id,
              action: 'updated',
              description: `Customer updated: ${data.first_name} ${data.last_name}`
            });

            return data;
          });

          // Update with real data
          setCustomers(prev => prev.map(c => c.id === id ? data : c));
          return true;
        },
        // Rollback
        () => setCustomers(prev => prev.map(c => c.id === id ? originalCustomer : c)),
        {
          successMessage: 'Customer updated successfully',
          errorMessage: 'Failed to update customer'
        }
      );
    } catch (error: unknown) {
      if (error instanceof SecurityError) {
        handleError(error, { title: 'Access Denied: You do not have permission to update customers.' });
      }
      return false;
    }
  };

  const deleteCustomer = async (id: string): Promise<boolean> => {
    if (!user) return false;

    // Store original for rollback
    const originalCustomer = customers.find(c => c.id === id);
    if (!originalCustomer) {
      handleError(new Error('Customer not found'), { title: 'Delete Failed' });
      return false;
    }

    try {
      return await executeUpdate(
        // Optimistic update
        () => setCustomers(prev => prev.filter(c => c.id !== id)),
        // Actual update
        async () => {
          await enforcePolicy('customers:delete', async () => {
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

            return true;
          });

          return true;
        },
        // Rollback
        () => setCustomers(prev => [...prev, originalCustomer].sort((a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )),
        {
          successMessage: 'Customer deleted successfully',
          errorMessage: 'Failed to delete customer'
        }
      );
    } catch (error: unknown) {
      if (error instanceof SecurityError) {
        handleError(error, { title: 'Access Denied: You do not have permission to delete customers.' });
      }
      return false;
    }
  };

  useEffect(() => {
    if (user) {
      fetchCustomers();
    }
  }, [user, fetchCustomers]);

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
