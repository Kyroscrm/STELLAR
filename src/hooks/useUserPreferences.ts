
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import type { Json } from '@/integrations/supabase/types';

export interface UserPreferences {
  id: string;
  discount_type: 'percentage' | 'fixed';
  default_discount_value: number;
  show_templates: boolean;
  preferences: Json;
  created_at: string;
  updated_at: string;
}

// Type guard to validate discount_type
const isValidDiscountType = (value: unknown): value is 'percentage' | 'fixed' => {
  return value === 'percentage' || value === 'fixed';
};

// Helper function to safely convert Supabase data to UserPreferences
const convertToUserPreferences = (data: unknown): UserPreferences => {
  const prefData = data as Record<string, unknown>;
  return {
    id: prefData.id as string,
    discount_type: isValidDiscountType(prefData.discount_type) ? prefData.discount_type : 'percentage',
    default_discount_value: typeof prefData.default_discount_value === 'number' ? prefData.default_discount_value : 0,
    show_templates: typeof prefData.show_templates === 'boolean' ? prefData.show_templates : false,
    preferences: (prefData.preferences as Json) || {},
    created_at: prefData.created_at as string,
    updated_at: prefData.updated_at as string
  };
};

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
        const safePreferences = convertToUserPreferences(data);
        setPreferences(safePreferences);
      } else {
        // Create default preferences if none exist
        await createDefaultPreferences();
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(`Failed to fetch user preferences: ${error.message}`);
      } else {
        toast.error('Failed to fetch user preferences');
      }
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

      const safePreferences = convertToUserPreferences(data);
      setPreferences(safePreferences);
      return safePreferences;
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(`Failed to create default preferences: ${error.message}`);
      } else {
        toast.error('Failed to create default preferences');
      }
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

      const safePreferences = convertToUserPreferences(data);
      setPreferences(safePreferences);
      return true;
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(`Failed to update preferences: ${error.message}`);
      } else {
        toast.error('Failed to update preferences');
      }
      return false;
    }
  };

  const updatePreference = async (key: string, value: unknown) => {
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
