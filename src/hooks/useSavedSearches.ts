import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';
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
  const [error, setError] = useState<Error | null>(null);

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
    setError(null);
    try {
      const { data, error } = await supabase
        .from('saved_searches')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setSearches(data || []);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch saved searches';
      setError(error instanceof Error ? error : new Error(errorMessage));
      toast.error(errorMessage);
      setSearches([]);
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
      const { data, error } = await supabase
        .from('saved_searches')
        .insert({ ...searchData, user_id: user.id })
        .select()
        .single();

      if (error) throw error;

      // Replace optimistic with real data
      setSearches(prev => prev.map(s => s.id === optimisticSearch.id ? data : s));

      toast.success('Search saved successfully');
      return data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save search';
      // Rollback optimistic update
      setSearches(prev => prev.filter(s => s.id !== optimisticSearch.id));
      toast.error(errorMessage);
      return null;
    }
  };

  const updateSearch = async (id: string, updates: Partial<Omit<SavedSearch, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => {
    if (!validateUserAndSession()) return false;

    // Store original for rollback
    const originalSearch = searches.find(s => s.id === id);
    if (!originalSearch) {
      toast.error('Saved search not found');
      return false;
    }

    // Optimistic update
    const optimisticSearch = { ...originalSearch, ...updates, updated_at: new Date().toISOString() };
    setSearches(prev => prev.map(s => s.id === id ? optimisticSearch : s));

    try {
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
      return true;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update search';
      // Rollback optimistic update
      setSearches(prev => prev.map(s => s.id === id ? originalSearch : s));
      toast.error(errorMessage);
      return false;
    }
  };

  const deleteSearch = async (id: string) => {
    if (!validateUserAndSession()) return;

    // Store original for rollback
    const originalSearch = searches.find(s => s.id === id);
    if (!originalSearch) {
      toast.error('Saved search not found');
      return;
    }

    // Optimistic update
    setSearches(prev => prev.filter(s => s.id !== id));

    try {
      const { error } = await supabase
        .from('saved_searches')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('Search deleted successfully');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete search';
      // Rollback optimistic update
      setSearches(prev => [...prev, originalSearch].sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ));
      toast.error(errorMessage);
    }
  };

  useEffect(() => {
    fetchSearches();
  }, [user, session]);

  return {
    searches,
    loading,
    error,
    createSearch,
    updateSearch,
    deleteSearch,
    fetchSearches
  };
};
