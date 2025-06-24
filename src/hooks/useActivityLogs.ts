import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export interface ActivityLog {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  description: string;
  metadata: unknown;
  created_at: string;
}

export const useActivityLogs = () => {
  const { user, session } = useAuth();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(false);

  const validateUserAndSession = () => {
    if (!user || !session) {
      toast.error('Authentication required. Please log in again.');
      return false;
    }
    return true;
  };

  const fetchLogs = async (limit: number = 50) => {
    if (!validateUserAndSession()) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      setLogs(data || []);
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error('Failed to fetch activity logs');
      } else {
        toast.error('Failed to fetch activity logs');
      }
    } finally {
      setLoading(false);
    }
  };

  const logActivity = async (action: string, entityType: string, entityId: string, description?: string, metadata?: unknown) => {
    if (!validateUserAndSession()) return;

    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .insert({
          user_id: user.id,
          action,
          entity_type: entityType,
          entity_id: entityId,
          description: description || `${action} ${entityType}`,
          metadata: metadata || {}
        })
        .select()
        .single();

      if (error) throw error;

      setLogs(prev => [data, ...prev.slice(0, 49)]); // Keep only latest 50
      return data;
    } catch (error: unknown) {
      return null;
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [user, session]);

  return {
    logs,
    loading,
    logActivity,
    fetchLogs
  };
};
