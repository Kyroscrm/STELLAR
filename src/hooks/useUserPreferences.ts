
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface UserPreferences {
  id: string;
  discount_type: 'percentage' | 'fixed';
  default_discount_value: number;
  show_templates: boolean;
  preferences: any;
  created_at: string;
  updated_at: string;
}

export const useUserPreferences = () => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchPreferences = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setPreferences(data);
      } else {
        // Create default preferences if none exist
        await createDefaultPreferences();
      }
    } catch (error: any) {
      console.error('Error fetching user preferences:', error);
      toast.error('Failed to fetch user preferences');
    } finally {
      setLoading(false);
    }
  };

  const createDefaultPreferences = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .insert({
          user_id: user.id,
          discount_type: 'percentage',
          default_discount_value: 0,
          show_templates: false,
          preferences: {}
        })
        .select()
        .single();

      if (error) throw error;

      setPreferences(data);
      return data;
    } catch (error: any) {
      console.error('Error creating default preferences:', error);
      return null;
    }
  };

  const updatePreferences = async (updates: Partial<Omit<UserPreferences, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => {
    if (!user || !preferences) return false;

    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      setPreferences(data);
      return true;
    } catch (error: any) {
      console.error('Error updating preferences:', error);
      toast.error('Failed to update preferences');
      return false;
    }
  };

  const updatePreference = async (key: string, value: any) => {
    if (!preferences) return false;

    const updates = { [key]: value };
    return await updatePreferences(updates);
  };

  useEffect(() => {
    fetchPreferences();
  }, [user]);

  return {
    preferences,
    loading,
    updatePreferences,
    updatePreference,
    fetchPreferences
  };
};
