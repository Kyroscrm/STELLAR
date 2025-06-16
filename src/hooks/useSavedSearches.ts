
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
  const { user } = useAuth();
  const [searches, setSearches] = useState<SavedSearch[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSearches = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('saved_searches')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSearches(data || []);
    } catch (error: any) {
      console.error('Error fetching saved searches:', error);
      toast.error('Failed to fetch saved searches');
    } finally {
      setLoading(false);
    }
  };

  const createSearch = async (searchData: Omit<SavedSearch, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('saved_searches')
        .insert({
          ...searchData,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      setSearches(prev => [data, ...prev]);
      toast.success('Search saved successfully');
      return data;
    } catch (error: any) {
      console.error('Error creating saved search:', error);
      toast.error('Failed to save search');
      return null;
    }
  };

  const updateSearch = async (id: string, updates: Partial<Omit<SavedSearch, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => {
    if (!user) return false;

    try {
      const { data, error } = await supabase
        .from('saved_searches')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      setSearches(prev => prev.map(search => 
        search.id === id ? data : search
      ));
      toast.success('Search updated successfully');
      return true;
    } catch (error: any) {
      console.error('Error updating saved search:', error);
      toast.error('Failed to update search');
      return false;
    }
  };

  const deleteSearch = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('saved_searches')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setSearches(prev => prev.filter(search => search.id !== id));
      toast.success('Search deleted successfully');
    } catch (error: any) {
      console.error('Error deleting saved search:', error);
      toast.error('Failed to delete search');
    }
  };

  useEffect(() => {
    fetchSearches();
  }, [user]);

  return {
    searches,
    loading,
    createSearch,
    updateSearch,
    deleteSearch,
    fetchSearches
  };
};
