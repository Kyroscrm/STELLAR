import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export type Customer = Tables<'customers'>;
type CustomerInsert = Omit<TablesInsert<'customers'>, 'user_id'>;
type CustomerUpdate = TablesUpdate<'customers'>;

interface CustomerFilters {
  search?: string;
  city?: string;
  state?: string;
  limit?: number;
  offset?: number;
}

const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes
const CACHE_KEY = 'customers_cache';

export const useOptimizedCustomers = (filters: CustomerFilters = {}) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const { user, session } = useAuth();

  const validateUserAndSession = useCallback(() => {
    if (!user || !session) {
      const errorMsg = 'Authentication required. Please log in again.';
      setError(new Error(errorMsg));
      toast.error(errorMsg);
      return false;
    }
    return true;
  }, [user, session]);

  // Generate cache key based on filters
  const getCacheKey = useCallback((userId: string, filterObj: CustomerFilters) => {
    const filterString = JSON.stringify(filterObj);
    return `${CACHE_KEY}_${userId}_${btoa(filterString)}`;
  }, []);

  // Optimized fetch with search and pagination
  const fetchCustomers = useCallback(async (filterObj: CustomerFilters = {}) => {
    if (!validateUserAndSession()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching optimized customers for user:', user.id, 'with filters:', filterObj);
      
      let query = supabase
        .from('customers')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id);

      // Apply search filter
      if (filterObj.search) {
        const searchTerm = filterObj.search.trim();
        query = query.or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,company_name.ilike.%${searchTerm}%`);
      }

      // Apply location filters
      if (filterObj.city) {
        query = query.eq('city', filterObj.city);
      }
      
      if (filterObj.state) {
        query = query.eq('state', filterObj.state);
      }

      // Apply pagination
      if (filterObj.limit) {
        query = query.limit(filterObj.limit);
      }
      
      if (filterObj.offset) {
        query = query.range(filterObj.offset, (filterObj.offset + (filterObj.limit || 50)) - 1);
      }

      // Order by most recent first
      query = query.order('created_at', { ascending: false });

      const { data, error, count } = await query;

      if (error) throw error;
      
      setCustomers(data || []);
      setTotalCount(count || 0);
      console.log(`Successfully fetched ${data?.length || 0} customers out of ${count || 0} total`);
    } catch (error: any) {
      console.error('Error fetching customers:', error);
      setError(error);
      toast.error('Failed to fetch customers');
      setCustomers([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [user, validateUserAndSession]);

  // Optimistic create with immediate UI update
  const createCustomer = useCallback(async (customerData: CustomerInsert) => {
    if (!validateUserAndSession()) return null;

    const optimisticId = `temp-${Date.now()}`;
    const optimisticCustomer: Customer = {
      id: optimisticId,
      ...customerData,
      user_id: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    } as Customer;

    // Optimistic update
    setCustomers(prev => [optimisticCustomer, ...prev]);
    setTotalCount(prev => prev + 1);

    try {
      console.log('Creating customer:', customerData);
      
      const { data, error } = await supabase
        .from('customers')
        .insert({ ...customerData, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      
      // Replace optimistic with real data
      setCustomers(prev => prev.map(c => c.id === optimisticId ? data : c));
      
      // Log activity in background
      supabase.from('activity_logs').insert({
        user_id: user.id,
        entity_type: 'customer',
        entity_id: data.id,
        action: 'created',
        description: `Customer created: ${data.first_name} ${data.last_name}`
      }).then(({ error }) => {
        if (error) console.warn('Failed to log activity:', error);
      });

      toast.success('Customer created successfully');
      console.log('Customer created successfully:', data);
      return data;
    } catch (error: any) {
      console.error('Error creating customer:', error);
      // Rollback optimistic update
      setCustomers(prev => prev.filter(c => c.id !== optimisticId));
      setTotalCount(prev => prev - 1);
      toast.error(error.message || 'Failed to create customer');
      return null;
    }
  }, [user, validateUserAndSession]);

  // Optimistic update with immediate UI feedback
  const updateCustomer = useCallback(async (id: string, updates: CustomerUpdate) => {
    if (!validateUserAndSession()) return false;

    const originalCustomer = customers.find(c => c.id === id);
    if (!originalCustomer) {
      toast.error('Customer not found');
      return false;
    }

    // Optimistic update
    const optimisticCustomer = { 
      ...originalCustomer, 
      ...updates, 
      updated_at: new Date().toISOString() 
    };
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
      
      // Log activity in background
      supabase.from('activity_logs').insert({
        user_id: user.id,
        entity_type: 'customer',
        entity_id: id,
        action: 'updated',
        description: `Customer updated: ${data.first_name} ${data.last_name}`
      }).then(({ error }) => {
        if (error) console.warn('Failed to log activity:', error);
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
  }, [user, customers, validateUserAndSession]);

  // Optimistic delete with immediate UI feedback
  const deleteCustomer = useCallback(async (id: string) => {
    if (!validateUserAndSession()) return;

    const originalCustomer = customers.find(c => c.id === id);
    if (!originalCustomer) {
      toast.error('Customer not found');
      return;
    }

    // Optimistic update
    setCustomers(prev => prev.filter(c => c.id !== id));
    setTotalCount(prev => prev - 1);

    try {
      console.log('Deleting customer:', id);
      
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      
      // Log activity in background
      supabase.from('activity_logs').insert({
        user_id: user.id,
        entity_type: 'customer',
        entity_id: id,
        action: 'deleted',
        description: `Customer deleted: ${originalCustomer.first_name} ${originalCustomer.last_name}`
      }).then(({ error }) => {
        if (error) console.warn('Failed to log activity:', error);
      });

      toast.success('Customer deleted successfully');
      console.log('Customer deleted successfully');
    } catch (error: any) {
      console.error('Error deleting customer:', error);
      // Rollback optimistic update
      setCustomers(prev => [...prev, originalCustomer].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ));
      setTotalCount(prev => prev + 1);
      toast.error(error.message || 'Failed to delete customer');
    }
  }, [user, customers, validateUserAndSession]);

  // Search with debouncing
  const searchCustomers = useCallback(async (searchTerm: string) => {
    const searchFilters = { ...filters, search: searchTerm, offset: 0 };
    await fetchCustomers(searchFilters);
  }, [filters, fetchCustomers]);

  // Load more for pagination
  const loadMore = useCallback(async () => {
    if (loading || customers.length >= totalCount) return;
    
    const newFilters = { 
      ...filters, 
      offset: customers.length,
      limit: filters.limit || 50
    };
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('user_id', user.id)
        .range(newFilters.offset!, newFilters.offset! + newFilters.limit! - 1)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setCustomers(prev => [...prev, ...(data || [])]);
    } catch (error: any) {
      console.error('Error loading more customers:', error);
      toast.error('Failed to load more customers');
    } finally {
      setLoading(false);
    }
  }, [loading, customers.length, totalCount, filters, user]);

  // Initial fetch and enhanced real-time subscriptions
  useEffect(() => {
    fetchCustomers(filters);
  }, [fetchCustomers, filters]);

  // Enhanced real-time updates with optimistic state management
  useEffect(() => {
    if (!user) return;

    let updateTimeout: NodeJS.Timeout;
    const debouncedUpdate = (callback: () => void) => {
      clearTimeout(updateTimeout);
      updateTimeout = setTimeout(callback, 500); // 500ms debounce
    };

    const channel = supabase
      .channel(`customers_realtime_${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'customers',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Real-time customer insert:', payload);
          const newCustomer = payload.new as Customer;
          
          setCustomers(prev => {
            // Check if already exists (optimistic update)
            const exists = prev.some(c => c.id === newCustomer.id);
            if (exists) return prev;
            
            return [newCustomer, ...prev].sort((a, b) => 
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );
          });
          setTotalCount(prev => prev + 1);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'customers',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Real-time customer update:', payload);
          const updatedCustomer = payload.new as Customer;
          
          debouncedUpdate(() => {
            setCustomers(prev => prev.map(c => c.id === updatedCustomer.id ? updatedCustomer : c));
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'customers',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Real-time customer delete:', payload);
          const deletedCustomer = payload.old as Customer;
          
          setCustomers(prev => prev.filter(c => c.id !== deletedCustomer.id));
          setTotalCount(prev => Math.max(0, prev - 1));
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Real-time customers subscription active');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Real-time customers subscription error');
          // Fallback to periodic refresh
          debouncedUpdate(() => fetchCustomers(filters));
        }
      });

    return () => {
      clearTimeout(updateTimeout);
      supabase.removeChannel(channel);
    };
  }, [user, filters, fetchCustomers]);

  return {
    customers,
    loading,
    error,
    totalCount,
    fetchCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    searchCustomers,
    loadMore,
    hasMore: customers.length < totalCount
  };
};
