import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export interface NotificationPreferences {
  id: string;
  user_id: string;
  email_notifications: boolean;
  push_notifications: boolean;
  notification_types: unknown;
  quiet_hours: unknown;
  frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
  created_at: string;
  updated_at: string;
}

// Type guard function
const isValidFrequency = (frequency: string): frequency is 'immediate' | 'hourly' | 'daily' | 'weekly' => {
  return ['immediate', 'hourly', 'daily', 'weekly'].includes(frequency);
};

// Safe conversion function
const convertToNotificationPreferences = (dbData: unknown): NotificationPreferences => {
  const data = dbData as any;
  return {
    ...data,
    frequency: isValidFrequency(data.frequency) ? data.frequency : 'immediate'
  };
};

export const useNotificationPreferences = () => {
  const { user, session } = useAuth();
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
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
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setPreferences(convertToNotificationPreferences(data));
      } else {
        await createDefaultPreferences();
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error('Failed to fetch notification preferences');
      } else {
        toast.error('Failed to fetch notification preferences');
      }
    } finally {
      setLoading(false);
    }
  };

  const createDefaultPreferences = async () => {
    if (!validateUserAndSession()) return;

    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .insert({
          user_id: user.id,
          email_notifications: true,
          push_notifications: true,
          notification_types: {
            estimates: true,
            invoices: true,
            jobs: true,
            leads: true,
            tasks: true
          },
          quiet_hours: {
            enabled: false,
            start: '22:00',
            end: '07:00'
          },
          frequency: 'immediate'
        })
        .select()
        .single();

      if (error) throw error;

      setPreferences(convertToNotificationPreferences(data));
      return data;
    } catch (error: unknown) {
      return null;
    }
  };

  const updatePreferences = async (updates: Partial<Omit<NotificationPreferences, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => {
    if (!validateUserAndSession() || !preferences) return false;

    // Optimistic update
    const optimisticPreferences = { ...preferences, ...updates, updated_at: new Date().toISOString() };
    setPreferences(optimisticPreferences);

    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      // Update with real data
      setPreferences(convertToNotificationPreferences(data));

      toast.success('Notification preferences updated');
      return true;
    } catch (error: unknown) {
      // Rollback optimistic update
      setPreferences(preferences);
      toast.error('Failed to update notification preferences');
      return false;
    }
  };

  useEffect(() => {
    fetchPreferences();
  }, [user, session]);

  return {
    preferences,
    loading,
    updatePreferences,
    fetchPreferences
  };
};
