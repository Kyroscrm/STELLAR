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

    // Store in database for persistence (only if createNotification is available)
    if (createNotification) {
      try {
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
      } catch (error) {
        // Silently fail - notification still shown as toast
      }
    }
  }, []); // Remove dependency to prevent constant recreation

  // Listen for system-generated notifications
  useEffect(() => {
    if (!user) return;

    let isSubscribed = true;

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
          if (!isSubscribed) return;

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
        if (isSubscribed) {
          setConnected(status === 'SUBSCRIBED');
        }
      });

    return () => {
      isSubscribed = false;
      supabase.removeChannel(channel);
      setConnected(false);
    };
  }, [user?.id]); // Only depend on user.id, not the whole user object or showNotification

  // Disable activity-based notifications to reduce WebSocket spam
  // TODO: Re-enable when optimized for production
  /*
  useEffect(() => {
    if (!user?.id) return;

    let isSubscribed = true;

    const channel = supabase
      .channel(`activity_notifications_${user.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'leads', filter: `user_id=eq.${user.id}` },
        (payload) => {
          if (!isSubscribed) return;
          const newLead = payload.new;
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
        })
      .subscribe();

    return () => {
      isSubscribed = false;
      supabase.removeChannel(channel);
    };
  }, [user?.id]);
  */

  return {
    connected,
    showNotification
  };
};
