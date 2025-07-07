import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useErrorHandler } from './useErrorHandler';
import { ActivityLog } from '@/types/app-types';

interface ActivityLogData {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  old_data?: Record<string, unknown>;
  new_data?: Record<string, unknown>;
  description?: string;
  created_at: string;
  updated_at: string;
}

interface ActivityLogDiff {
  field: string;
  oldValue: unknown;
  newValue: unknown;
}

interface LogActivityParams {
  entityType: string;
  entityId: string;
  action: string;
  description?: string;
  oldData?: Record<string, unknown>;
  newData?: Record<string, unknown>;
  changedFields?: string[];
  complianceLevel?: 'standard' | 'high' | 'critical';
  riskScore?: number;
}

export const useEnhancedActivityLogs = () => {
  const { user, session } = useAuth();
  const [logs, setLogs] = useState<ActivityLogData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { handleError } = useErrorHandler();

  const validateUserAndSession = () => {
    if (!user || !session) {
      toast.error('Authentication required. Please log in again.');
      return false;
    }
    return true;
  };

  const fetchLogs = async () => {
    if (!validateUserAndSession()) return;

    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setLogs(data || []);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch activity logs';
      setError(error instanceof Error ? error : new Error(errorMessage));
      toast.error(errorMessage);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const compareObjects = (oldObj: Record<string, unknown>, newObj: Record<string, unknown>): ActivityLogDiff[] => {
    const changes: ActivityLogDiff[] = [];
    const allKeys = new Set([...Object.keys(oldObj), ...Object.keys(newObj)]);

    for (const key of allKeys) {
      const oldValue = oldObj[key];
      const newValue = newObj[key];

      if (oldValue !== newValue) {
        changes.push({
          field: key,
          oldValue,
          newValue
        });
      }
    }

    return changes;
  };

  const logActivity = async (
    action: string,
    entityType: string,
    entityId: string,
    description: string,
    oldData?: Record<string, unknown>,
    newData?: Record<string, unknown>
  ) => {
    if (!validateUserAndSession()) return;

    try {
      const { error } = await supabase
        .from('activity_logs')
        .insert({
          user_id: user.id,
          action,
          entity_type: entityType,
          entity_id: entityId,
          description,
          old_data: oldData,
          new_data: newData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to log activity';
      toast.error(errorMessage);
    }
  };

  const getEntityAuditHistory = async (entityType: string, entityId: string, limit = 50) => {
    if (!validateUserAndSession()) return [];

    try {
      const { data, error } = await supabase.rpc('get_entity_audit_logs', {
        p_entity_type: entityType,
        p_entity_id: entityId,
        p_limit: limit
      });

      if (error) throw error;

      return data || [];
    } catch (error: unknown) {
      const auditError = error instanceof Error ? error : new Error('Failed to fetch audit history');
      handleError(auditError, { title: 'Failed to fetch audit history' });
      return [];
    }
  };

  const getFieldChangeHistory = async (entityType: string, entityId: string, fieldName: string, limit = 20) => {
    if (!validateUserAndSession()) return [];

    try {
      const { data, error } = await supabase.rpc('get_field_change_history', {
        p_entity_type: entityType,
        p_entity_id: entityId,
        p_field_name: fieldName,
        p_limit: limit
      });

      if (error) throw error;

      return data || [];
    } catch (error: unknown) {
      const fieldError = error instanceof Error ? error : new Error('Failed to fetch field history');
      handleError(fieldError, { title: 'Failed to fetch field change history' });
      return [];
    }
  };

  const getCurrentSessionId = async (): Promise<string | null> => {
    try {
      // Try to get or start a user session
      const browserInfo = getBrowserInfo();
      const { data, error } = await supabase.rpc('start_user_session', {
        p_user_id: user.id,
        p_ip_address: browserInfo.ipAddress,
        p_user_agent: browserInfo.userAgent,
        p_device_info: browserInfo.deviceInfo,
        p_location_data: null // Could be enhanced with geolocation
      });

      if (error) throw error;

      return data;
    } catch (error) {
      return null;
    }
  };

  const getBrowserInfo = () => {
    return {
      userAgent: navigator.userAgent,
      ipAddress: null, // Would need to be fetched from an external service
      deviceInfo: {
        platform: navigator.platform,
        language: navigator.language,
        cookieEnabled: navigator.cookieEnabled,
        onLine: navigator.onLine,
        screenResolution: `${screen.width}x${screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      }
    };
  };

  const logEntityChange = async (
    entityType: string,
    entityId: string,
    action: 'created' | 'updated' | 'deleted',
    oldData?: Record<string, unknown>,
    newData?: Record<string, unknown>,
    description?: string
  ) => {
    const changedFields = oldData && newData ? compareObjects(oldData, newData) : [];

    return await logActivity({
      entityType,
      entityId,
      action,
      description: description || `${entityType} ${action}`,
      oldData,
      newData,
      changedFields,
      complianceLevel: getComplianceLevel(entityType, action),
      riskScore: calculateRiskScore(action, changedFields)
    });
  };

  const getComplianceLevel = (entityType: string, action: string): 'standard' | 'high' | 'critical' => {
    // Define compliance levels based on entity type and action
    const criticalEntities = ['invoices', 'payments', 'customers'];
    const highRiskActions = ['deleted', 'exported', 'shared'];

    if (criticalEntities.includes(entityType) || highRiskActions.includes(action)) {
      return 'critical';
    } else if (entityType === 'estimates' || action === 'updated') {
      return 'high';
    } else {
      return 'standard';
    }
  };

  const calculateRiskScore = (action: string, changedFields: string[]): number => {
    let score = 0;

    // Base score by action
    switch (action) {
      case 'deleted':
        score += 50;
        break;
      case 'updated':
        score += 10;
        break;
      case 'created':
        score += 5;
        break;
      default:
        score += 1;
    }

    // Additional score based on sensitive fields
    const sensitiveFields = ['amount', 'total', 'email', 'phone', 'address', 'status'];
    const sensitiveChanges = changedFields.filter(field =>
      sensitiveFields.some(sensitive => field.toLowerCase().includes(sensitive))
    );

    score += sensitiveChanges.length * 10;

    return Math.min(score, 100); // Cap at 100
  };

  useEffect(() => {
    fetchLogs();
  }, [user, session]);

  return {
    logs,
    loading,
    error,
    logActivity,
    fetchLogs,
    getEntityAuditHistory,
    getFieldChangeHistory,
    compareObjects
  };
};
