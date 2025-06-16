
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface NotificationPreferences {
  id: string;
  user_id: string;
  email_notifications: boolean;
  push_notifications: boolean;
  notification_types: any;
  quiet_hours: any;
  frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
  created_at: string;
  updated_at: string;
}

export const useNotificationPreferences = () => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchPreferences = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setPreferences(data);
      } else {
        await createDefaultPreferences();
      }
    } catch (error: any) {
      console.error('Error fetching notification preferences:', error);
      toast.error('Failed to fetch notification preferences');
    } finally {
      setLoading(false);
    }
  };

  const createDefaultPreferences = async () => {
    if (!user) return;

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
      setPreferences(data);
      return data;
    } catch (error: any) {
      console.error('Error creating default notification preferences:', error);
      return null;
    }
  };

  const updatePreferences = async (updates: Partial<Omit<NotificationPreferences, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => {
    if (!user || !preferences) return false;

    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      setPreferences(data);
      toast.success('Notification preferences updated');
      return true;
    } catch (error: any) {
      console.error('Error updating notification preferences:', error);
      toast.error('Failed to update notification preferences');
      return false;
    }
  };

  useEffect(() => {
    fetchPreferences();
  }, [user]);

  return {
    preferences,
    loading,
    updatePreferences,
    fetchPreferences
  };
};
