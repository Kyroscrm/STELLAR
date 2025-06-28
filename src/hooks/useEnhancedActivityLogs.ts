import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useErrorHandler } from './useErrorHandler';

interface ActivityLog {
  id: string;
  user_id: string;
  entity_type: string;
  entity_id: string;
  action: string;
  description: string;
  old_data: any;
  new_data: any;
  changed_fields: string[];
  ip_address: string;
  user_agent: string;
  session_id: string;
  compliance_level: string;
  risk_score: number;
  created_at: string;
}

interface LogActivityParams {
  entityType: string;
  entityId: string;
  action: string;
  description?: string;
  oldData?: any;
  newData?: any;
  changedFields?: string[];
  complianceLevel?: 'standard' | 'high' | 'critical';
  riskScore?: number;
}

export const useEnhancedActivityLogs = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();
  const { handleError } = useErrorHandler();

  const validateUserAndSession = () => {
    if (!user) {
      const errorMsg = 'Authentication required for activity logging';
      setError(new Error(errorMsg));
      return false;
    }
    return true;
  };

  const fetchActivityLogs = async (filters?: {
    entityType?: string;
    entityId?: string;
    limit?: number;
    offset?: number;
  }) => {
    if (!validateUserAndSession()) return;

    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('activity_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (filters?.entityType) {
        query = query.eq('entity_type', filters.entityType);
      }

      if (filters?.entityId) {
        query = query.eq('entity_id', filters.entityId);
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      if (filters?.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1);
      }

      const { data, error } = await query;

      if (error) throw error;

      setLogs(data || []);
    } catch (error: unknown) {
      const logError = error instanceof Error ? error : new Error('Failed to fetch activity logs');
      setError(logError);
      handleError(logError, { title: 'Failed to fetch activity logs' });
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const logActivity = async (params: LogActivityParams) => {
    if (!validateUserAndSession()) return null;

    try {
      // Get current session and browser info
      const sessionId = await getCurrentSessionId();
      const browserInfo = getBrowserInfo();

      const { data, error } = await supabase.rpc('log_activity', {
        p_action: params.action,
        p_entity_type: params.entityType,
        p_entity_id: params.entityId,
        p_description: params.description || null,
        p_old_data: params.oldData || null,
        p_new_data: params.newData || null,
        p_changed_fields: params.changedFields || null,
        p_ip_address: browserInfo.ipAddress || null,
        p_user_agent: browserInfo.userAgent || null,
        p_session_id: sessionId || null,
        p_compliance_level: params.complianceLevel || 'standard',
        p_risk_score: params.riskScore || 0
      });

      if (error) throw error;

      return data;
    } catch (error: unknown) {
      const logError = error instanceof Error ? error : new Error('Failed to log activity');
      handleError(logError, { title: 'Activity logging failed' });
      return null;
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

  const compareObjects = (oldObj: any, newObj: any): string[] => {
    const changedFields: string[] = [];

    if (!oldObj || !newObj) return changedFields;

    // Get all keys from both objects
    const allKeys = new Set([...Object.keys(oldObj), ...Object.keys(newObj)]);

    allKeys.forEach(key => {
      if (oldObj[key] !== newObj[key]) {
        changedFields.push(key);
      }
    });

    return changedFields;
  };

  const logEntityChange = async (
    entityType: string,
    entityId: string,
    action: 'created' | 'updated' | 'deleted',
    oldData?: any,
    newData?: any,
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
    if (user) {
      fetchActivityLogs();
    }
  }, [user]);

  return {
    logs,
    loading,
    error,
    fetchActivityLogs,
    logActivity,
    logEntityChange,
    getEntityAuditHistory,
    getFieldChangeHistory,
    compareObjects
  };
};
