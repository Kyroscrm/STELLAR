
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface FollowUpReminder {
  id: string;
  entity_type: 'lead' | 'estimate' | 'invoice';
  entity_id: string;
  reminder_date: string;
  message: string;
  status: 'pending' | 'sent' | 'dismissed';
  created_at: string;
  entity_data?: any;
}

export const useFollowUpReminders = () => {
  const { user } = useAuth();
  const [reminders, setReminders] = useState<FollowUpReminder[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchReminders = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('follow_up_reminders')
        .select(`
          *,
          leads!left(first_name, last_name, email),
          estimates!left(title, estimate_number),
          invoices!left(title, invoice_number)
        `)
        .eq('user_id', user.id)
        .eq('status', 'pending')
        .order('reminder_date');

      if (error) throw error;
      
      const typedReminders = (data || []).map(reminder => ({
        id: reminder.id,
        entity_type: reminder.entity_type as 'lead' | 'estimate' | 'invoice',
        entity_id: reminder.entity_id,
        reminder_date: reminder.reminder_date,
        message: reminder.message,
        status: reminder.status as 'pending' | 'sent' | 'dismissed',
        created_at: reminder.created_at,
        entity_data: reminder.leads || reminder.estimates || reminder.invoices
      })) as FollowUpReminder[];
      
      setReminders(typedReminders);
    } catch (error: any) {
      console.error('Error fetching reminders:', error);
    } finally {
      setLoading(false);
    }
  };

  const createReminder = async (reminderData: {
    entity_type: 'lead' | 'estimate' | 'invoice';
    entity_id: string;
    reminder_date: string;
    message: string;
  }) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('follow_up_reminders')
        .insert({ ...reminderData, user_id: user.id })
        .select()
        .single();

      if (error) throw error;

      const newReminder: FollowUpReminder = {
        id: data.id,
        entity_type: data.entity_type as 'lead' | 'estimate' | 'invoice',
        entity_id: data.entity_id,
        reminder_date: data.reminder_date,
        message: data.message,
        status: data.status as 'pending' | 'sent' | 'dismissed',
        created_at: data.created_at
      };

      setReminders(prev => [...prev, newReminder]);
      toast.success('Follow-up reminder created');
      return newReminder;
    } catch (error: any) {
      console.error('Error creating reminder:', error);
      toast.error('Failed to create reminder');
      return null;
    }
  };

  const markAsSent = async (id: string) => {
    try {
      const { error } = await supabase
        .from('follow_up_reminders')
        .update({ status: 'sent' })
        .eq('id', id);

      if (error) throw error;

      setReminders(prev => prev.filter(r => r.id !== id));
      toast.success('Reminder marked as sent');
    } catch (error: any) {
      console.error('Error updating reminder:', error);
      toast.error('Failed to update reminder');
    }
  };

  const dismissReminder = async (id: string) => {
    try {
      const { error } = await supabase
        .from('follow_up_reminders')
        .update({ status: 'dismissed' })
        .eq('id', id);

      if (error) throw error;

      setReminders(prev => prev.filter(r => r.id !== id));
      toast.success('Reminder dismissed');
    } catch (error: any) {
      console.error('Error dismissing reminder:', error);
      toast.error('Failed to dismiss reminder');
    }
  };

  // Auto-create reminders based on lead status
  const createAutoReminders = async (leadId: string, status: string) => {
    const reminderSchedule = {
      'new': { days: 1, message: 'Follow up on new lead inquiry' },
      'contacted': { days: 3, message: 'Check in on lead progress' },
      'qualified': { days: 7, message: 'Follow up on qualified lead' }
    };

    const schedule = reminderSchedule[status as keyof typeof reminderSchedule];
    if (!schedule) return;

    const reminderDate = new Date();
    reminderDate.setDate(reminderDate.getDate() + schedule.days);

    await createReminder({
      entity_type: 'lead',
      entity_id: leadId,
      reminder_date: reminderDate.toISOString(),
      message: schedule.message
    });
  };

  useEffect(() => {
    fetchReminders();
  }, [user]);

  return {
    reminders,
    loading,
    createReminder,
    markAsSent,
    dismissReminder,
    createAutoReminders,
    fetchReminders
  };
};
