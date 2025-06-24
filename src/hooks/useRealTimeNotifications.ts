import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useNotifications } from './useNotifications';
import { Tables } from '@/integrations/supabase/types';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';
export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface RealTimeNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  entity_type?: string;
  entity_id?: string;
  auto_dismiss?: boolean;
  action_url?: string;
}

type UserNotificationRecord = Tables<'user_notifications'>;
type LeadRecord = Tables<'leads'>;
type JobRecord = Tables<'jobs'>;
type TaskRecord = Tables<'tasks'>;
type InvoiceRecord = Tables<'invoices'>;

interface UseRealTimeNotificationsReturn {
  connected: boolean;
  showNotification: (notification: RealTimeNotification) => void;
}

export const useRealTimeNotifications = (): UseRealTimeNotificationsReturn => {
  const { user } = useAuth();
  const { createNotification } = useNotifications();
  const [connected, setConnected] = useState(false);

  const showNotification = useCallback((notification: RealTimeNotification) => {
    // Show toast notification
    const toastFn = notification.type === 'error' ? toast.error :
                   notification.type === 'warning' ? toast.warning :
                   notification.type === 'success' ? toast.success : toast.info;

    toastFn(notification.message, {
      description: notification.title,
      duration: notification.priority === 'urgent' ? 10000 :
               notification.priority === 'high' ? 6000 : 4000
    });

    // Store in database for persistence
    createNotification({
      type: notification.type,
      title: notification.title,
      message: notification.message,
      priority: notification.priority,
      entity_type: notification.entity_type,
      entity_id: notification.entity_id,
      action_url: notification.action_url,
      read: false,
      dismissed: notification.auto_dismiss || false,
      metadata: {
        source: 'real_time',
        timestamp: new Date().toISOString()
      }
    });
  }, [createNotification]);

  // Listen for system-generated notifications
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`user_notifications_${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload: RealtimePostgresChangesPayload<UserNotificationRecord>) => {
          const notification = payload.new as UserNotificationRecord | null;
          if (notification && !notification.dismissed) {
            showNotification({
              id: notification.id,
              type: notification.type as NotificationType,
              title: notification.title,
              message: notification.message,
              priority: notification.priority as NotificationPriority,
              entity_type: notification.entity_type || undefined,
              entity_id: notification.entity_id || undefined,
              action_url: notification.action_url || undefined,
              auto_dismiss: false
            });
          }
        }
      )
      .subscribe((status) => {
        setConnected(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
      setConnected(false);
    };
  }, [user, showNotification]);

  // Activity-based smart notifications
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`activity_notifications_${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'leads',
          filter: `user_id=eq.${user.id}`
        },
        (payload: RealtimePostgresChangesPayload<LeadRecord>) => {
          const newLead = payload.new as LeadRecord | null;
          if (newLead) {
            showNotification({
              id: `lead_${newLead.id}`,
              type: 'info',
              title: 'New Lead',
              message: `New lead: ${newLead.first_name} ${newLead.last_name}`,
              priority: 'medium',
              entity_type: 'lead',
              entity_id: newLead.id,
              action_url: '/admin/leads'
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'jobs',
          filter: `user_id=eq.${user.id}`
        },
        (payload: RealtimePostgresChangesPayload<JobRecord>) => {
          const oldJob = payload.old as JobRecord | null;
          const newJob = payload.new as JobRecord | null;
          if (oldJob && newJob && oldJob.status !== newJob.status) {
            showNotification({
              id: `job_${newJob.id}`,
              type: 'success',
              title: 'Job Status Updated',
              message: `Job "${newJob.title}" status changed to ${newJob.status}`,
              priority: 'medium',
              entity_type: 'job',
              entity_id: newJob.id,
              action_url: '/admin/jobs'
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'tasks',
          filter: `user_id=eq.${user.id}`
        },
        (payload: RealtimePostgresChangesPayload<TaskRecord>) => {
          const oldTask = payload.old as TaskRecord | null;
          const newTask = payload.new as TaskRecord | null;
          if (oldTask && newTask && oldTask.status !== 'completed' && newTask.status === 'completed') {
            showNotification({
              id: `task_${newTask.id}`,
              type: 'success',
              title: 'Task Completed',
              message: `Task "${newTask.title}" has been completed`,
              priority: 'low',
              entity_type: 'task',
              entity_id: newTask.id,
              action_url: '/admin/tasks'
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'invoices',
          filter: `user_id=eq.${user.id}`
        },
        (payload: RealtimePostgresChangesPayload<InvoiceRecord>) => {
          const oldInvoice = payload.old as InvoiceRecord | null;
          const newInvoice = payload.new as InvoiceRecord | null;
          if (oldInvoice && newInvoice && oldInvoice.status !== 'paid' && newInvoice.status === 'paid') {
            showNotification({
              id: `invoice_${newInvoice.id}`,
              type: 'success',
              title: 'Payment Received',
              message: `Invoice #${newInvoice.invoice_number} has been paid`,
              priority: 'high',
              entity_type: 'invoice',
              entity_id: newInvoice.id,
              action_url: '/admin/invoices'
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, showNotification]);

  return {
    connected,
    showNotification
  };
};
