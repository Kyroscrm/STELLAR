import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export interface FollowUpReminder {
  id: string;
  user_id: string;
  entity_type: string;
  entity_id: string;
  message: string;
  reminder_date: string;
  status: string;
  created_at: string;
  entity_data?: Record<string, unknown>; // Added entity_data property
}

export const useFollowUpReminders = () => {
  const { user } = useAuth();
  const [reminders, setReminders] = useState<FollowUpReminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchReminders = async () => {
    if (!user) {
      setReminders([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error: supabaseError } = await supabase
        .from('follow_up_reminders')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'pending')
        .order('reminder_date', { ascending: true });

      if (supabaseError) {
        throw supabaseError;
      }

      setReminders(data || []);
      setError(null);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err);
      } else {
        setError(new Error('Failed to fetch reminders'));
      }
      setReminders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, [user]);

  const addReminder = async (reminderData: Omit<FollowUpReminder, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('follow_up_reminders')
        .insert([{ ...reminderData, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;

      setReminders(prev => [...prev, data]);
      toast.success('Reminder added successfully');

      // Log activity
      await supabase.from('activity_logs').insert({
        user_id: user.id,
        entity_type: 'reminder',
        entity_id: data.id,
        action: 'created',
        description: `Follow-up reminder created: ${reminderData.message}`
      });

      return data;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Could not create the reminder.';
      toast.error('Error creating reminder: ' + errorMessage);
      return null;
    }
  };

  const updateReminder = async (reminderId: string, updates: Partial<FollowUpReminder>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('follow_up_reminders')
        .update(updates)
        .eq('id', reminderId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      setReminders(prev => prev.map(reminder =>
        reminder.id === reminderId ? data : reminder
      ));

      toast.success('Reminder updated successfully');

      // Log activity
      await supabase.from('activity_logs').insert({
        user_id: user.id,
        entity_type: 'reminder',
        entity_id: reminderId,
        action: 'updated',
        description: `Follow-up reminder updated`
      });

      return data;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Could not update the reminder.';
      toast.error('Error updating reminder: ' + errorMessage);
      return null;
    }
  };

  const markAsSent = async (reminderId: string) => {
    const result = await updateReminder(reminderId, { status: 'sent' });
    if (result) {
      setReminders(prev => prev.filter(reminder => reminder.id !== reminderId));
      toast.success('Reminder marked as sent');
    }
  };

  const dismissReminder = async (reminderId: string) => {
    const result = await updateReminder(reminderId, { status: 'dismissed' });
    if (result) {
      setReminders(prev => prev.filter(reminder => reminder.id !== reminderId));
      toast.success('Reminder dismissed');
    }
  };

  const deleteReminder = async (reminderId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('follow_up_reminders')
        .delete()
        .eq('id', reminderId)
        .eq('user_id', user.id);

      if (error) throw error;

      setReminders(prev => prev.filter(reminder => reminder.id !== reminderId));
      toast.success('Reminder deleted successfully');

      // Log activity
      await supabase.from('activity_logs').insert({
        user_id: user.id,
        entity_type: 'reminder',
        entity_id: reminderId,
        action: 'deleted',
        description: `Follow-up reminder deleted`
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Could not delete the reminder.';
      toast.error('Error deleting reminder: ' + errorMessage);
    }
  };

  return {
    reminders,
    loading,
    error,
    addReminder,
    updateReminder,
    deleteReminder,
    markAsSent,
    dismissReminder,
    fetchReminders
  };
};
