
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
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
        if (status === 'SUBSCRIBED') {
          console.log('Real-time notifications connected');
        }
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
        onUpdate: (payload: any) => {
          showNotification({
            id: `lead_${payload.new.id}`,
            type: 'info',
            title: 'New Lead',
            message: `New lead: ${payload.new.first_name} ${payload.new.last_name}`,
            priority: 'medium',
            entity_type: 'lead',
            entity_id: payload.new.id,
            action_url: '/admin/leads'
          });
        }
      },
      // Job status changes
      {
        table: 'jobs',
        event: 'UPDATE' as const,
        onUpdate: (payload: any) => {
          if (payload.old.status !== payload.new.status) {
            showNotification({
              id: `job_${payload.new.id}`,
              type: 'success',
              title: 'Job Status Updated',
              message: `Job "${payload.new.title}" status changed to ${payload.new.status}`,
              priority: 'medium',
              entity_type: 'job',
              entity_id: payload.new.id,
              action_url: '/admin/jobs'
            });
          }
        }
      },
      // Task completions
      {
        table: 'tasks',
        event: 'UPDATE' as const,
        onUpdate: (payload: any) => {
          if (payload.old.status !== 'completed' && payload.new.status === 'completed') {
            showNotification({
              id: `task_${payload.new.id}`,
              type: 'success',
              title: 'Task Completed',
              message: `Task "${payload.new.title}" has been completed`,
              priority: 'low',
              entity_type: 'task',
              entity_id: payload.new.id,
              action_url: '/admin/tasks'
            });
          }
        }
      },
      // Invoice payments
      {
        table: 'invoices',
        event: 'UPDATE' as const,
        onUpdate: (payload: any) => {
          if (payload.old.status !== 'paid' && payload.new.status === 'paid') {
            showNotification({
              id: `invoice_${payload.new.id}`,
              type: 'success',
              title: 'Payment Received',
              message: `Invoice #${payload.new.invoice_number} has been paid`,
              priority: 'high',
              entity_type: 'invoice',
              entity_id: payload.new.id,
              action_url: '/admin/invoices'
            });
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
