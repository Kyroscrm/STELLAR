import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, Json } from '@/integrations/supabase/types';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { ActivityLog, ApiError } from '@/types/app-types';
import { useErrorHandler } from './useErrorHandler';
import { useOptimisticUpdate } from './useOptimisticUpdate';
import { enforcePolicy, SecurityError, handleSupabaseError } from '@/lib/security';

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

export const useActivityLogs = (): UseActivityLogsReturn => {
  const { user, session } = useAuth();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
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

  const fetchLogs = async (limit: number = 50) => {
    if (!validateUserAndSession()) return;

    setLoading(true);
    setError(null);
    try {
      const data = await enforcePolicy('activity_logs:read', async () => {
        const { data, error } = await supabase
          .from('activity_logs')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(limit);

        if (error) throw error;
        return data || [];
      });

      setLogs(data);
    } catch (error: unknown) {
      if (error instanceof SecurityError) {
        setError(error);
        handleError(error, { title: 'Access Denied: You do not have permission to view activity logs.' });
      } else {
        const processedError = handleSupabaseError(error);
        setError(processedError);
        handleError(processedError, { title: 'Failed to fetch activity logs' });
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

    // Create optimistic log entry
    const optimisticLog = {
      id: `temp-${Date.now()}`,
      user_id: user.id,
      action,
      entity_type: entityType,
      entity_id: entityId,
      description: description || `${action} ${entityType}`,
      metadata: metadata || {},
      created_at: new Date().toISOString(),
      session_id: null,
      old_data: {},
      new_data: {},
      changed_fields: [],
      ip_address: '',
      user_agent: '',
      severity: 'info',
      risk_score: 0,
      compliance_level: 'standard'
    } as unknown as ActivityLog;

    try {
      return await executeUpdate(
        // Optimistic update
        () => setLogs(prev => [optimisticLog, ...prev.slice(0, 49)]), // Keep only latest 50
        // Actual update
        async () => {
          const data = await enforcePolicy('activity_logs:create', async () => {
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
            return data;
          });

          return data;
        },
        // Rollback
        () => setLogs(prev => prev.filter(log => log.id !== optimisticLog.id)),
        {
          // Don't show toasts for activity logs since they're background operations
          successMessage: '',
          errorMessage: '',
          onError: (error) => {
            handleError(error, {
              title: 'Failed to log activity',
              showToast: false,
              logError: true
            });
          }
        }
      );
    } catch (error: unknown) {
      if (error instanceof SecurityError) {
        handleError(error, { title: 'Access Denied: You do not have permission to create activity logs.', showToast: false });
      } else {
        handleError(handleSupabaseError(error), { title: 'Failed to log activity', showToast: false });
      }
      return null;
    }
  };

  useEffect(() => {
    if (user && session) {
      fetchLogs();
    }
  }, [user, session]);

  return {
    logs,
    loading,
    error,
    fetchLogs,
    logActivity
  };
};
