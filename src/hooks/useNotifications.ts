import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate, Json } from '@/integrations/supabase/types';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { ApiError } from '@/types/app-types';
import { useErrorHandler } from './useErrorHandler';
import { useOptimisticUpdate } from './useOptimisticUpdate';

export type UserNotification = Tables<'user_notifications'>;
type UserNotificationInsert = Omit<TablesInsert<'user_notifications'>, 'user_id'>;
type UserNotificationUpdate = TablesUpdate<'user_notifications'>;

// Type guard function
const isValidPriority = (priority: string): priority is 'low' | 'medium' | 'high' | 'urgent' => {
  return ['low', 'medium', 'high', 'urgent'].includes(priority);
};

// Safe conversion functions
const convertToUserNotification = (dbData: unknown): UserNotification => {
  const data = dbData as Partial<UserNotification>;
  return {
    ...data,
    priority: isValidPriority(data.priority as string) ? data.priority as 'low' | 'medium' | 'high' | 'urgent' : 'medium'
  } as UserNotification;
};

const convertToUserNotificationArray = (dbDataArray: unknown[]): UserNotification[] => {
  return dbDataArray.map(convertToUserNotification);
};

interface UseNotificationsReturn {
  notifications: UserNotification[];
  loading: boolean;
  error: Error | null;
  unreadCount: number;
  createNotification: (notificationData: UserNotificationInsert) => Promise<UserNotification | null>;
  markAsRead: (id: string) => Promise<boolean>;
  markAllAsRead: () => Promise<boolean>;
  dismissNotification: (id: string) => Promise<boolean>;
  deleteNotification: (id: string) => Promise<void>;
  fetchNotifications: () => Promise<void>;
}

const isSupabaseError = (error: unknown): error is ApiError => {
  return typeof error === 'object' && error !== null && 'error' in error && typeof (error as ApiError).error === 'object';
};

export const useNotifications = (): UseNotificationsReturn => {
  const { user, session } = useAuth();
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const { handleError } = useErrorHandler();
  const { executeUpdate } = useOptimisticUpdate();

  const validateUserAndSession = () => {
    if (!user || !session) {
      const errorMsg = 'Authentication required. Please log in again.';
      setError(new Error(errorMsg));
      toast.error(errorMsg);
      return false;
    }
    return true;
  };

  const fetchNotifications = async () => {
    if (!validateUserAndSession()) return;

    setLoading(true);
    setError(null);
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
        setError(error);
        handleError(error, { title: 'Failed to fetch notifications' });
      } else if (isSupabaseError(error)) {
        const supabaseError = new Error(error.error.message);
        setError(supabaseError);
        handleError(supabaseError, { title: 'Failed to fetch notifications' });
      } else {
        const fallbackError = new Error('An unexpected error occurred while fetching notifications');
        setError(fallbackError);
        handleError(fallbackError, { title: 'Failed to fetch notifications' });
      }
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const createNotification = async (notificationData: UserNotificationInsert) => {
    if (!validateUserAndSession()) return null;

    const optimisticNotification: UserNotification = {
      id: `temp-${Date.now()}`,
      user_id: user.id,
      created_at: new Date().toISOString(),
      read: false,
      dismissed: false,
      ...notificationData
    } as UserNotification;

    try {
      return await executeUpdate(
        // Optimistic update
        () => {
          setNotifications(prev => [optimisticNotification, ...prev]);
          if (!optimisticNotification.read) {
            setUnreadCount(prev => prev + 1);
          }
        },
        // Actual update
        async () => {
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
        },
        // Rollback
        () => {
          setNotifications(prev => prev.filter(n => n.id !== optimisticNotification.id));
          if (!optimisticNotification.read) {
            setUnreadCount(prev => Math.max(0, prev - 1));
          }
        },
        {
          successMessage: 'Notification created',
          errorMessage: 'Failed to create notification'
        }
      );
    } catch (error: unknown) {
      return null;
    }
  };

  const markAsRead = async (id: string) => {
    if (!validateUserAndSession()) return false;

    // Store original for rollback
    const originalNotification = notifications.find(n => n.id === id);
    if (!originalNotification) {
      handleError(new Error('Notification not found'), { title: 'Failed to mark notification as read' });
      return false;
    }

    if (originalNotification.read) return true; // Already read

    // Create the optimistic update
    const optimisticNotification = { ...originalNotification, read: true, read_at: new Date().toISOString() };

    try {
      return await executeUpdate(
        // Optimistic update
        () => {
          setNotifications(prev => prev.map(n => n.id === id ? optimisticNotification : n));
          setUnreadCount(prev => Math.max(0, prev - 1));
        },
        // Actual update
        async () => {
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
        },
        // Rollback
        () => {
          setNotifications(prev => prev.map(n => n.id === id ? originalNotification : n));
          setUnreadCount(prev => prev + 1);
        },
        {
          successMessage: 'Notification marked as read',
          errorMessage: 'Failed to mark notification as read'
        }
      );
    } catch (error: unknown) {
      return false;
    }
  };

  const markAllAsRead = async () => {
    if (!validateUserAndSession()) return false;

    const unreadNotifications = notifications.filter(n => !n.read);
    if (unreadNotifications.length === 0) return true;

    // Create timestamp for all updates
    const timestamp = new Date().toISOString();

    try {
      return await executeUpdate(
        // Optimistic update
        () => {
          setNotifications(prev => prev.map(n =>
            !n.read ? { ...n, read: true, read_at: timestamp } : n
          ));
          setUnreadCount(0);
        },
        // Actual update
        async () => {
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
        },
        // Rollback
        () => {
          setNotifications(prev => prev.map(n => {
            const original = unreadNotifications.find(un => un.id === n.id);
            return original || n;
          }));
          setUnreadCount(unreadNotifications.length);
        },
        {
          successMessage: 'All notifications marked as read',
          errorMessage: 'Failed to mark all notifications as read'
        }
      );
    } catch (error: unknown) {
      return false;
    }
  };

  const dismissNotification = async (id: string) => {
    if (!validateUserAndSession()) return false;

    // Store original for rollback
    const originalNotification = notifications.find(n => n.id === id);
    if (!originalNotification) {
      handleError(new Error('Notification not found'), { title: 'Failed to dismiss notification' });
      return false;
    }

    // Create the optimistic update
    const optimisticNotification = { ...originalNotification, dismissed: true, dismissed_at: new Date().toISOString() };

    try {
      return await executeUpdate(
        // Optimistic update
        () => setNotifications(prev => prev.map(n => n.id === id ? optimisticNotification : n)),
        // Actual update
        async () => {
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
        },
        // Rollback
        () => setNotifications(prev => prev.map(n => n.id === id ? originalNotification : n)),
        {
          successMessage: 'Notification dismissed',
          errorMessage: 'Failed to dismiss notification'
        }
      );
    } catch (error: unknown) {
      return false;
    }
  };

  const deleteNotification = async (id: string) => {
    if (!validateUserAndSession()) return;

    // Store original for rollback
    const originalNotification = notifications.find(n => n.id === id);
    if (!originalNotification) {
      handleError(new Error('Notification not found'), { title: 'Failed to delete notification' });
      return;
    }

    try {
      await executeUpdate(
        // Optimistic update
        () => {
          setNotifications(prev => prev.filter(n => n.id !== id));
          if (!originalNotification.read) {
            setUnreadCount(prev => Math.max(0, prev - 1));
          }
        },
        // Actual update
        async () => {
          const { error } = await supabase
            .from('user_notifications')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id);

          if (error) throw error;
          return true;
        },
        // Rollback
        () => {
          setNotifications(prev => [...prev, originalNotification].sort((a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          ));
          if (!originalNotification.read) {
            setUnreadCount(prev => prev + 1);
          }
        },
        {
          successMessage: 'Notification deleted',
          errorMessage: 'Failed to delete notification'
        }
      );
    } catch (error: unknown) {
      // Error handling is managed by executeUpdate
    }
  };

  useEffect(() => {
    if (user && session) {
      fetchNotifications();
    }
  }, [user, session]);

  return {
    notifications,
    loading,
    error,
    unreadCount,
    createNotification,
    markAsRead,
    markAllAsRead,
    dismissNotification,
    deleteNotification,
    fetchNotifications
  };
};
