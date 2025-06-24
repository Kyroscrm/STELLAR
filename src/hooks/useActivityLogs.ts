import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, Json } from '@/integrations/supabase/types';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { ActivityLog, ApiError } from '@/types/app-types';
import { useErrorHandler } from './useErrorHandler';

export type ActivityLogInsert = Omit<TablesInsert<'activity_logs'>, 'user_id'>;

interface UseActivityLogsReturn {
  logs: ActivityLog[];
  loading: boolean;
  error: Error | null;
  fetchLogs: (limit?: number) => Promise<void>;
  logActivity: (
    action: string,
    entityType: string,
    entityId: string,
    description?: string,
    metadata?: Json
  ) => Promise<ActivityLog | null>;
}

const isSupabaseError = (error: unknown): error is ApiError => {
  return typeof error === 'object' && error !== null && 'error' in error && typeof (error as ApiError).error === 'object';
};

export const useActivityLogs = (): UseActivityLogsReturn => {
  const { user, session } = useAuth();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { handleError } = useErrorHandler();

  const validateUserAndSession = () => {
    if (!user || !session) {
      const errorMsg = 'Authentication required. Please log in again.';
      setError(new Error(errorMsg));
      toast.error(errorMsg);
      return false;
    }
    return true;
  };

  const fetchLogs = async (limit: number = 50) => {
    if (!validateUserAndSession()) return;

    setLoading(true);
    setError(null);
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
        setError(error);
        handleError(error, { title: 'Failed to fetch activity logs' });
      } else if (isSupabaseError(error)) {
        const supabaseError = new Error(error.error.message);
        setError(supabaseError);
        handleError(supabaseError, { title: 'Failed to fetch activity logs' });
      } else {
        const fallbackError = new Error('An unexpected error occurred while fetching activity logs');
        setError(fallbackError);
        handleError(fallbackError, { title: 'Failed to fetch activity logs' });
      }
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const logActivity = async (
    action: string,
    entityType: string,
    entityId: string,
    description?: string,
    metadata?: Json
  ): Promise<ActivityLog | null> => {
    if (!validateUserAndSession()) return null;

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

      // Update state with the new log entry
      setLogs(prev => [data, ...prev.slice(0, 49)]); // Keep only latest 50
      return data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        handleError(error, { title: 'Failed to log activity', showToast: false });
      } else if (isSupabaseError(error)) {
        const supabaseError = new Error(error.error.message);
        handleError(supabaseError, { title: 'Failed to log activity', showToast: false });
      } else {
        const fallbackError = new Error('An unexpected error occurred while logging activity');
        handleError(fallbackError, { title: 'Failed to log activity', showToast: false });
      }
      return null;
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [user, session]);

  return {
    logs,
    loading,
    error,
    fetchLogs,
    logActivity
  };
};
