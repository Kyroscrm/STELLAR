
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
      console.log('Fetching activity logs for user:', user.id);
      
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      
      setLogs(data || []);
      console.log(`Successfully fetched ${data?.length || 0} activity logs`);
    } catch (error: any) {
      console.error('Error fetching activity logs:', error);
      toast.error('Failed to fetch activity logs');
    } finally {
      setLoading(false);
    }
  };

  const logActivity = async (action: string, entityType: string, entityId: string, description?: string, metadata?: any) => {
    if (!validateUserAndSession()) return;

    try {
      console.log('Logging activity:', { action, entityType, entityId, description });
      
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
      console.log('Activity logged successfully:', data);
      return data;
    } catch (error: any) {
      console.error('Error logging activity:', error);
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
