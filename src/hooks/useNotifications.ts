
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
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
  metadata: any;
  created_at: string;
  read_at?: string;
  dismissed_at?: string;
}

export const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setNotifications(data || []);
      setUnreadCount(data?.filter(n => !n.read).length || 0);
    } catch (error: any) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  const createNotification = async (notificationData: Omit<UserNotification, 'id' | 'user_id' | 'created_at' | 'read_at' | 'dismissed_at'>) => {
    if (!user) return null;

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

      setNotifications(prev => [data, ...prev]);
      if (!data.read) {
        setUnreadCount(prev => prev + 1);
      }
      return data;
    } catch (error: any) {
      console.error('Error creating notification:', error);
      return null;
    }
  };

  const markAsRead = async (id: string) => {
    if (!user) return false;

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

      setNotifications(prev => prev.map(notification => 
        notification.id === id ? data : notification
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
      return true;
    } catch (error: any) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  };

  const markAllAsRead = async () => {
    if (!user) return false;

    try {
      const { data, error } = await supabase
        .from('user_notifications')
        .update({ 
          read: true,
          read_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('read', false)
        .select();

      if (error) throw error;

      setNotifications(prev => prev.map(notification => 
        !notification.read ? { ...notification, read: true, read_at: new Date().toISOString() } : notification
      ));
      setUnreadCount(0);
      return true;
    } catch (error: any) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }
  };

  const dismissNotification = async (id: string) => {
    if (!user) return false;

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

      setNotifications(prev => prev.map(notification => 
        notification.id === id ? data : notification
      ));
      return true;
    } catch (error: any) {
      console.error('Error dismissing notification:', error);
      return false;
    }
  };

  const deleteNotification = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_notifications')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      const notification = notifications.find(n => n.id === id);
      setNotifications(prev => prev.filter(notification => notification.id !== id));
      if (notification && !notification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error: any) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [user]);

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
