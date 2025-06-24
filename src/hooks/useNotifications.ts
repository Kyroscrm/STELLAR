import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export interface UserNotification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  entity_type?: string;
  entity_id?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  read: boolean;
  dismissed: boolean;
  action_url?: string;
  metadata: unknown;
  created_at: string;
  read_at?: string;
  dismissed_at?: string;
}

// Type guard function
const isValidPriority = (priority: string): priority is 'low' | 'medium' | 'high' | 'urgent' => {
  return ['low', 'medium', 'high', 'urgent'].includes(priority);
};

// Safe conversion functions
const convertToUserNotification = (dbData: unknown): UserNotification => {
  const data = dbData as any;
  return {
    ...data,
    priority: isValidPriority(data.priority) ? data.priority : 'medium'
  };
};

const convertToUserNotificationArray = (dbDataArray: unknown[]): UserNotification[] => {
  return dbDataArray.map(convertToUserNotification);
};

export const useNotifications = () => {
  const { user, session } = useAuth();
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const validateUserAndSession = () => {
    if (!user || !session) {
      toast.error('Authentication required. Please log in again.');
      return false;
    }
    return true;
  };

  const fetchNotifications = async () => {
    if (!validateUserAndSession()) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const convertedNotifications = convertToUserNotificationArray(data || []);
      setNotifications(convertedNotifications);
      setUnreadCount(convertedNotifications.filter(n => !n.read).length);
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error('Failed to fetch notifications');
      } else {
        toast.error('Failed to fetch notifications');
      }
    } finally {
      setLoading(false);
    }
  };

  const createNotification = async (notificationData: Omit<UserNotification, 'id' | 'user_id' | 'created_at' | 'read_at' | 'dismissed_at'>) => {
    if (!validateUserAndSession()) return null;

    const optimisticNotification: UserNotification = {
      id: `temp-${Date.now()}`,
      user_id: user.id,
      created_at: new Date().toISOString(),
      read_at: undefined,
      dismissed_at: undefined,
      ...notificationData
    };

    // Optimistic update
    setNotifications(prev => [optimisticNotification, ...prev]);
    if (!optimisticNotification.read) {
      setUnreadCount(prev => prev + 1);
    }

    try {
      const { data, error } = await supabase
        .from('user_notifications')
        .insert({
          ...notificationData,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      const convertedNotification = convertToUserNotification(data);

      // Replace optimistic with real data
      setNotifications(prev => prev.map(n => n.id === optimisticNotification.id ? convertedNotification : n));

      return convertedNotification;
    } catch (error: unknown) {
      // Rollback optimistic update
      setNotifications(prev => prev.filter(n => n.id !== optimisticNotification.id));
      if (!optimisticNotification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      return null;
    }
  };

  const markAsRead = async (id: string) => {
    if (!validateUserAndSession()) return false;

    // Store original for rollback
    const originalNotification = notifications.find(n => n.id === id);
    if (!originalNotification) {
      toast.error('Notification not found');
      return false;
    }

    if (originalNotification.read) return true; // Already read

    // Optimistic update
    const optimisticNotification = { ...originalNotification, read: true, read_at: new Date().toISOString() };
    setNotifications(prev => prev.map(n => n.id === id ? optimisticNotification : n));
    setUnreadCount(prev => Math.max(0, prev - 1));

    try {
      const { data, error } = await supabase
        .from('user_notifications')
        .update({
          read: true,
          read_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      const convertedNotification = convertToUserNotification(data);

      // Update with real data
      setNotifications(prev => prev.map(n => n.id === id ? convertedNotification : n));

      return true;
    } catch (error: unknown) {
      // Rollback optimistic update
      setNotifications(prev => prev.map(n => n.id === id ? originalNotification : n));
      setUnreadCount(prev => prev + 1);
      return false;
    }
  };

  const markAllAsRead = async () => {
    if (!validateUserAndSession()) return false;

    const unreadNotifications = notifications.filter(n => !n.read);
    if (unreadNotifications.length === 0) return true;

    // Optimistic update
    const timestamp = new Date().toISOString();
    setNotifications(prev => prev.map(n =>
      !n.read ? { ...n, read: true, read_at: timestamp } : n
    ));
    setUnreadCount(0);

    try {
      const { data, error } = await supabase
        .from('user_notifications')
        .update({
          read: true,
          read_at: timestamp
        })
        .eq('user_id', user.id)
        .eq('read', false)
        .select();

      if (error) throw error;

      return true;
    } catch (error: unknown) {
      // Rollback optimistic update
      setNotifications(prev => prev.map(n => {
        const original = unreadNotifications.find(un => un.id === n.id);
        return original || n;
      }));
      setUnreadCount(unreadNotifications.length);
      return false;
    }
  };

  const dismissNotification = async (id: string) => {
    if (!validateUserAndSession()) return false;

    // Store original for rollback
    const originalNotification = notifications.find(n => n.id === id);
    if (!originalNotification) {
      toast.error('Notification not found');
      return false;
    }

    // Optimistic update
    const optimisticNotification = { ...originalNotification, dismissed: true, dismissed_at: new Date().toISOString() };
    setNotifications(prev => prev.map(n => n.id === id ? optimisticNotification : n));

    try {
      const { data, error } = await supabase
        .from('user_notifications')
        .update({
          dismissed: true,
          dismissed_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      const convertedNotification = convertToUserNotification(data);

      // Update with real data
      setNotifications(prev => prev.map(n => n.id === id ? convertedNotification : n));

      return true;
    } catch (error: unknown) {
      // Rollback optimistic update
      setNotifications(prev => prev.map(n => n.id === id ? originalNotification : n));
      return false;
    }
  };

  const deleteNotification = async (id: string) => {
    if (!validateUserAndSession()) return;

    // Store original for rollback
    const originalNotification = notifications.find(n => n.id === id);
    if (!originalNotification) {
      toast.error('Notification not found');
      return;
    }

    // Optimistic update
    setNotifications(prev => prev.filter(n => n.id !== id));
    if (!originalNotification.read) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }

    try {
      const { error } = await supabase
        .from('user_notifications')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

    } catch (error: unknown) {
      // Rollback optimistic update
      setNotifications(prev => [...prev, originalNotification].sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ));
      if (!originalNotification.read) {
        setUnreadCount(prev => prev + 1);
      }
      toast.error('Failed to delete notification');
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [user, session]);

  return {
    notifications,
    loading,
    unreadCount,
    createNotification,
    markAsRead,
    markAllAsRead,
    dismissNotification,
    deleteNotification,
    fetchNotifications
  };
};
