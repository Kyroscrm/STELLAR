import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export interface EnhancedActivityLog {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  description: string;
  metadata: unknown;
  created_at: string;
  // Enhanced fields
  compliance_level?: 'standard' | 'high' | 'critical';
  audit_trail_id?: string;
  risk_score?: number;
}

export const useEnhancedActivityLogs = (options: { limit?: number; includeAudit?: boolean } = {}) => {
  const { limit = 50, includeAudit = true } = options;
  const [logs, setLogs] = useState<EnhancedActivityLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { user, session } = useAuth();

  const validateUserAndSession = () => {
    if (!user || !session) {
      const errorMsg = 'Authentication required. Please log in again.';
      setError(new Error(errorMsg));
      toast.error(errorMsg);
      return false;
    }
    return true;
  };

  const fetchEnhancedLogs = async () => {
    if (!validateUserAndSession()) return;

    setLoading(true);
    setError(null);
    try {
      // Fetch regular activity logs
      const { data: activityData, error: activityError } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (activityError) throw activityError;

      const enhancedLogs: EnhancedActivityLog[] = (activityData || []).map(log => ({
        ...log,
        compliance_level: getComplianceLevel(log.entity_type, log.action),
        risk_score: calculateRiskScore(log.entity_type, log.action)
      }));

      setLogs(enhancedLogs);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error);
        toast.error('Failed to fetch activity logs');
      } else {
        const fallbackError = new Error('An unexpected error occurred while fetching activity logs');
        setError(fallbackError);
        toast.error(fallbackError.message);
      }
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const logEnhancedActivity = async (
    action: string,
    entityType: string,
    entityId: string,
    description?: string,
    metadata?: unknown,
    includeAuditTrail: boolean = true
  ) => {
    if (!validateUserAndSession()) return null;

    try {
      // Log to activity_logs table using the existing log_activity function
      const { error: activityError } = await supabase.rpc('log_activity', {
        p_action: action,
        p_entity_type: entityType,
        p_entity_id: entityId,
        p_description: description || `${action} ${entityType}`,
        p_metadata: metadata || {}
      });

      if (activityError) throw activityError;

      // Fetch the newly created log to return it
      const { data: newLogData } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('action', action)
        .eq('entity_type', entityType)
        .eq('entity_id', entityId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (newLogData) {
        // Create enhanced log entry
        const enhancedLog: EnhancedActivityLog = {
          ...newLogData,
          compliance_level: getComplianceLevel(entityType, action),
          risk_score: calculateRiskScore(entityType, action)
        };

        setLogs(prev => [enhancedLog, ...prev.slice(0, limit - 1)]);
        return enhancedLog;
      }

      return null;
    } catch (error: unknown) {
      return null;
    }
  };

  const getComplianceLevel = (entityType: string, action: string): 'standard' | 'high' | 'critical' => {
    if (['invoices', 'payments', 'signed_documents'].includes(entityType)) {
      return 'critical';
    }
    if (['customers', 'jobs', 'estimates'].includes(entityType)) {
      return 'high';
    }
    return 'standard';
  };

  const calculateRiskScore = (entityType: string, action: string): number => {
    let score = 0;

    // Base score by action
    switch (action.toLowerCase()) {
      case 'delete':
        score += 80;
        break;
      case 'update':
        score += 40;
        break;
      case 'create':
        score += 20;
        break;
      default:
        score += 10;
    }

    // Modifier by entity type
    if (['invoices', 'payments'].includes(entityType)) {
      score += 20;
    } else if (['customers', 'signed_documents'].includes(entityType)) {
      score += 15;
    }

    return Math.min(100, score);
  };

  useEffect(() => {
    if (user && session) {
      fetchEnhancedLogs();
    }
  }, [user, session, limit, includeAudit]);

  return {
    logs,
    loading,
    error,
    fetchEnhancedLogs,
    logEnhancedActivity
  };
};
