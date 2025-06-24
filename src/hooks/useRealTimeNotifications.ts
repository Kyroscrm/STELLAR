import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useNotifications } from './useNotifications';

interface RealTimeNotification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  entity_type?: string;
  entity_id?: string;
  auto_dismiss?: boolean;
  action_url?: string;
}

export const useRealTimeNotifications = () => {
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
        (payload) => {
          const notification = payload.new;
          if (notification && !notification.dismissed) {
            showNotification({
              id: notification.id,
              type: notification.type || 'info',
              title: notification.title,
              message: notification.message,
              priority: notification.priority || 'medium',
              entity_type: notification.entity_type,
              entity_id: notification.entity_id,
              action_url: notification.action_url,
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

    const configs = [
      // New leads
      {
        table: 'leads',
        event: 'INSERT' as const,
        onUpdate: (payload: unknown) => {
          if (payload && typeof payload === 'object' && 'new' in payload) {
            const newLead = payload.new as any;
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
      },
      // Job status changes
      {
        table: 'jobs',
        event: 'UPDATE' as const,
        onUpdate: (payload: unknown) => {
          if (payload && typeof payload === 'object' && 'old' in payload && 'new' in payload) {
            const oldJob = (payload as any).old;
            const newJob = (payload as any).new;
            if (oldJob.status !== newJob.status) {
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
        }
      },
      // Task completions
      {
        table: 'tasks',
        event: 'UPDATE' as const,
        onUpdate: (payload: unknown) => {
          if (payload && typeof payload === 'object' && 'old' in payload && 'new' in payload) {
            const oldTask = (payload as any).old;
            const newTask = (payload as any).new;
            if (oldTask.status !== 'completed' && newTask.status === 'completed') {
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
        }
      },
      // Invoice payments
      {
        table: 'invoices',
        event: 'UPDATE' as const,
        onUpdate: (payload: unknown) => {
          if (payload && typeof payload === 'object' && 'old' in payload && 'new' in payload) {
            const oldInvoice = (payload as any).old;
            const newInvoice = (payload as any).new;
            if (oldInvoice.status !== 'paid' && newInvoice.status === 'paid') {
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
        }
      }
    ];

    // Use the real-time subscriptions hook
    const channel = supabase
      .channel(`activity_notifications_${user.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads', filter: `user_id=eq.${user.id}` }, configs[0].onUpdate)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'jobs', filter: `user_id=eq.${user.id}` }, configs[1].onUpdate)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks', filter: `user_id=eq.${user.id}` }, configs[2].onUpdate)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'invoices', filter: `user_id=eq.${user.id}` }, configs[3].onUpdate)
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
