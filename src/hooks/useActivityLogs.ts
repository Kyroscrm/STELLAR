
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ActivityLog {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  description: string;
  metadata: any;
  created_at: string;
}

export const useActivityLogs = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchLogs = async (limit: number = 50) => {
    if (!user) return;

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
    } catch (error: any) {
      console.error('Error fetching activity logs:', error);
      toast.error('Failed to fetch activity logs');
    } finally {
      setLoading(false);
    }
  };

  const logActivity = async (action: string, entityType: string, entityId: string, description?: string, metadata?: any) => {
    if (!user) return;

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
    } catch (error: any) {
      console.error('Error logging activity:', error);
      return null;
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [user]);

  return {
    logs,
    loading,
    logActivity,
    fetchLogs
  };
};
