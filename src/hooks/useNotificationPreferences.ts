import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Tables, Json } from '@/integrations/supabase/types';
import { ApiError } from '@/types/app-types';

export type NotificationFrequency = 'immediate' | 'hourly' | 'daily' | 'weekly';

export interface NotificationTypes {
  estimates: boolean;
  invoices: boolean;
  jobs: boolean;
  leads: boolean;
  tasks: boolean;
  [key: string]: boolean; // Allow additional notification types
}

export interface QuietHours {
  enabled: boolean;
  start: string;
  end: string;
  [key: string]: boolean | string; // Allow additional quiet hours settings
}

export interface NotificationPreferences {
  id: string;
  user_id: string;
  email_notifications: boolean;
  push_notifications: boolean;
  notification_types: NotificationTypes;
  quiet_hours: QuietHours;
  frequency: NotificationFrequency;
  created_at: string;
  updated_at: string;
}

// Type guard function
const isValidFrequency = (frequency: string): frequency is NotificationFrequency => {
  return ['immediate', 'hourly', 'daily', 'weekly'].includes(frequency);
};

// Type guard function for notification types
const isValidNotificationTypes = (types: unknown): types is NotificationTypes => {
  if (!types || typeof types !== 'object') return false;
  const obj = types as Record<string, unknown>;
  const requiredKeys = ['estimates', 'invoices', 'jobs', 'leads', 'tasks'];
  return requiredKeys.every(key => key in obj && typeof obj[key] === 'boolean');
};

// Type guard function for quiet hours
const isValidQuietHours = (hours: unknown): hours is QuietHours => {
  if (!hours || typeof hours !== 'object') return false;
  const obj = hours as Record<string, unknown>;
  return (
    'enabled' in obj && typeof obj.enabled === 'boolean' &&
    'start' in obj && typeof obj.start === 'string' &&
    'end' in obj && typeof obj.end === 'string'
  );
};

// Safe conversion function
const convertToNotificationPreferences = (dbData: unknown): NotificationPreferences => {
  const data = dbData as Record<string, unknown>;
  return {
    id: String(data.id),
    user_id: String(data.user_id),
    email_notifications: Boolean(data.email_notifications),
    push_notifications: Boolean(data.push_notifications),
    notification_types: isValidNotificationTypes(data.notification_types) ? data.notification_types : {
      estimates: true,
      invoices: true,
      jobs: true,
      leads: true,
      tasks: true
    },
    quiet_hours: isValidQuietHours(data.quiet_hours) ? data.quiet_hours : {
      enabled: false,
      start: '22:00',
      end: '07:00'
    },
    frequency: isValidFrequency(String(data.frequency)) ? String(data.frequency) as NotificationFrequency : 'immediate',
    created_at: String(data.created_at),
    updated_at: String(data.updated_at)
  };
};

interface UseNotificationPreferencesReturn {
  preferences: NotificationPreferences | null;
  loading: boolean;
  fetchPreferences: () => Promise<void>;
  createDefaultPreferences: () => Promise<NotificationPreferences | null>;
  updatePreferences: (updates: Partial<Omit<NotificationPreferences, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => Promise<boolean>;
}

const isSupabaseError = (error: unknown): error is ApiError => {
  return typeof error === 'object' && error !== null && 'error' in error && typeof (error as ApiError).error === 'object';
};

export const useNotificationPreferences = (): UseNotificationPreferencesReturn => {
  const { user, session } = useAuth();
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(false);

  const validateUserAndSession = (): boolean => {
    if (!user || !session) {
      toast.error('Authentication required. Please log in again.');
      return false;
    }
    return true;
  };

  const fetchPreferences = async (): Promise<void> => {
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
      if (isSupabaseError(error)) {
        const errorMessage = error.error.message || 'Failed to fetch notification preferences';
        toast.error(errorMessage);
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to fetch notification preferences');
      }
    } finally {
      setLoading(false);
    }
  };

  const createDefaultPreferences = async (): Promise<NotificationPreferences | null> => {
    if (!validateUserAndSession()) return null;

    try {
      const defaultPreferences = {
        user_id: user.id,
        email_notifications: true,
        push_notifications: true,
        notification_types: {
          estimates: true,
          invoices: true,
          jobs: true,
          leads: true,
          tasks: true
        } as Json,
        quiet_hours: {
          enabled: false,
          start: '22:00',
          end: '07:00'
        } as Json,
        frequency: 'immediate' as const
      };

      const { data, error } = await supabase
        .from('notification_preferences')
        .insert(defaultPreferences)
        .select()
        .single();

      if (error) throw error;

      const convertedPreferences = convertToNotificationPreferences(data);
      setPreferences(convertedPreferences);
      return convertedPreferences;
    } catch (error: unknown) {
      if (isSupabaseError(error)) {
        const errorMessage = error.error.message || 'Failed to create default preferences';
        toast.error(errorMessage);
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to create default preferences');
      }
      return null;
    }
  };

  const updatePreferences = async (updates: Partial<Omit<NotificationPreferences, 'id' | 'user_id' | 'created_at' | 'updated_at'>>): Promise<boolean> => {
    if (!validateUserAndSession() || !preferences) return false;

    // Convert updates to match Supabase types
    const supabaseUpdates = {
      ...updates,
      notification_types: updates.notification_types as Json,
      quiet_hours: updates.quiet_hours as Json
    };

    // Optimistic update
    const optimisticPreferences = { ...preferences, ...updates, updated_at: new Date().toISOString() };
    setPreferences(optimisticPreferences);

    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .update(supabaseUpdates)
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
      if (isSupabaseError(error)) {
        const errorMessage = error.error.message || 'Failed to update preferences';
        toast.error(errorMessage);
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to update preferences');
      }
      return false;
    }
  };

  useEffect(() => {
    fetchPreferences();
  }, [user?.id]);

  return {
    preferences,
    loading,
    fetchPreferences,
    createDefaultPreferences,
    updatePreferences
  };
};
