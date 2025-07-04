
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface DashboardPreferences {
  id: string;
  user_id: string;
  layout: any;
  widget_positions: any;
  visible_widgets: string[];
  theme_settings: any;
  created_at: string;
  updated_at: string;
}

export const useDashboardPreferences = () => {
  const { user, session } = useAuth();
  const [preferences, setPreferences] = useState<DashboardPreferences | null>(null);
  const [loading, setLoading] = useState(false);

  const validateUserAndSession = () => {
    if (!user || !session) {
      toast.error('Authentication required. Please log in again.');
      return false;
    }
    return true;
  };

  const fetchPreferences = async () => {
    if (!validateUserAndSession()) return;

    setLoading(true);
    try {
      console.log('Fetching dashboard preferences for user:', user.id);
      
      const { data, error } = await supabase
        .from('dashboard_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setPreferences(data);
        console.log('Dashboard preferences fetched successfully');
      } else {
        await createDefaultPreferences();
      }
    } catch (error: any) {
      console.error('Error fetching dashboard preferences:', error);
      toast.error('Failed to fetch dashboard preferences');
    } finally {
      setLoading(false);
    }
  };

  const createDefaultPreferences = async () => {
    if (!validateUserAndSession()) return;

    try {
      console.log('Creating default dashboard preferences');
      
      const { data, error } = await supabase
        .from('dashboard_preferences')
        .insert({
          user_id: user.id,
          layout: { columns: 3 },
          widget_positions: {},
          visible_widgets: ['stats', 'recent-activity', 'metrics'],
          theme_settings: { mode: 'light' }
        })
        .select()
        .single();

      if (error) throw error;
      
      setPreferences(data);
      console.log('Default dashboard preferences created successfully');
      return data;
    } catch (error: any) {
      console.error('Error creating default dashboard preferences:', error);
      return null;
    }
  };

  const updatePreferences = async (updates: Partial<Omit<DashboardPreferences, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => {
    if (!validateUserAndSession() || !preferences) return false;

    // Optimistic update
    const optimisticPreferences = { ...preferences, ...updates, updated_at: new Date().toISOString() };
    setPreferences(optimisticPreferences);

    try {
      console.log('Updating dashboard preferences:', updates);
      
      const { data, error } = await supabase
        .from('dashboard_preferences')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      
      // Update with real data
      setPreferences(data);
      
      console.log('Dashboard preferences updated successfully');
      return true;
    } catch (error: any) {
      console.error('Error updating dashboard preferences:', error);
      // Rollback optimistic update
      setPreferences(preferences);
      toast.error('Failed to update dashboard preferences');
      return false;
    }
  };

  const updateWidgetPosition = async (widgetId: string, position: any) => {
    if (!preferences) return false;

    const newPositions = {
      ...preferences.widget_positions,
      [widgetId]: position
    };

    return await updatePreferences({ widget_positions: newPositions });
  };

  const toggleWidgetVisibility = async (widgetId: string) => {
    if (!preferences) return false;

    const visible = preferences.visible_widgets.includes(widgetId);
    const newVisibleWidgets = visible
      ? preferences.visible_widgets.filter(id => id !== widgetId)
      : [...preferences.visible_widgets, widgetId];

    return await updatePreferences({ visible_widgets: newVisibleWidgets });
  };

  useEffect(() => {
    fetchPreferences();
  }, [user, session]);

  return {
    preferences,
    loading,
    updatePreferences,
    updateWidgetPosition,
    toggleWidgetVisibility,
    fetchPreferences
  };
};
