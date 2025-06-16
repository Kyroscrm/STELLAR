
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface SavedSearch {
  id: string;
  user_id: string;
  name: string;
  query: string;
  filters: any;
  entity_types: string[];
  created_at: string;
  updated_at: string;
}

export const useSavedSearches = () => {
  const { user, session } = useAuth();
  const [searches, setSearches] = useState<SavedSearch[]>([]);
  const [loading, setLoading] = useState(false);

  const validateUserAndSession = () => {
    if (!user || !session) {
      toast.error('Authentication required. Please log in again.');
      return false;
    }
    return true;
  };

  const fetchSearches = async () => {
    if (!validateUserAndSession()) return;

    setLoading(true);
    try {
      console.log('Fetching saved searches for user:', user.id);
      
      const { data, error } = await supabase
        .from('saved_searches')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setSearches(data || []);
      console.log(`Successfully fetched ${data?.length || 0} saved searches`);
    } catch (error: any) {
      console.error('Error fetching saved searches:', error);
      toast.error('Failed to fetch saved searches');
    } finally {
      setLoading(false);
    }
  };

  const createSearch = async (searchData: Omit<SavedSearch, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!validateUserAndSession()) return null;

    const optimisticSearch: SavedSearch = {
      id: `temp-${Date.now()}`,
      user_id: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...searchData
    };

    // Optimistic update
    setSearches(prev => [optimisticSearch, ...prev]);

    try {
      console.log('Creating saved search:', searchData);
      
      const { data, error } = await supabase
        .from('saved_searches')
        .insert({
          ...searchData,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      // Replace optimistic with real data
      setSearches(prev => prev.map(s => s.id === optimisticSearch.id ? data : s));
      
      toast.success('Search saved successfully');
      console.log('Saved search created successfully:', data);
      return data;
    } catch (error: any) {
      console.error('Error creating saved search:', error);
      // Rollback optimistic update
      setSearches(prev => prev.filter(s => s.id !== optimisticSearch.id));
      toast.error('Failed to save search');
      return null;
    }
  };

  const updateSearch = async (id: string, updates: Partial<Omit<SavedSearch, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => {
    if (!validateUserAndSession()) return false;

    // Store original for rollback
    const originalSearch = searches.find(s => s.id === id);
    if (!originalSearch) {
      toast.error('Search not found');
      return false;
    }

    // Optimistic update
    const optimisticSearch = { ...originalSearch, ...updates, updated_at: new Date().toISOString() };
    setSearches(prev => prev.map(s => s.id === id ? optimisticSearch : s));

    try {
      console.log('Updating saved search:', id, updates);
      
      const { data, error } = await supabase
        .from('saved_searches')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      // Update with real data
      setSearches(prev => prev.map(s => s.id === id ? data : s));
      
      toast.success('Search updated successfully');
      console.log('Saved search updated successfully:', data);
      return true;
    } catch (error: any) {
      console.error('Error updating saved search:', error);
      // Rollback optimistic update
      setSearches(prev => prev.map(s => s.id === id ? originalSearch : s));
      toast.error('Failed to update search');
      return false;
    }
  };

  const deleteSearch = async (id: string) => {
    if (!validateUserAndSession()) return;

    // Store original for rollback
    const originalSearch = searches.find(s => s.id === id);
    if (!originalSearch) {
      toast.error('Search not found');
      return;
    }

    // Optimistic update
    setSearches(prev => prev.filter(s => s.id !== id));

    try {
      console.log('Deleting saved search:', id);
      
      const { error } = await supabase
        .from('saved_searches')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('Search deleted successfully');
      console.log('Saved search deleted successfully');
    } catch (error: any) {
      console.error('Error deleting saved search:', error);
      // Rollback optimistic update
      setSearches(prev => [...prev, originalSearch].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ));
      toast.error('Failed to delete search');
    }
  };

  useEffect(() => {
    fetchSearches();
  }, [user, session]);

  return {
    searches,
    loading,
    createSearch,
    updateSearch,
    deleteSearch,
    fetchSearches
  };
};
