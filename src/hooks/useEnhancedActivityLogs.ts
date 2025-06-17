
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuditTrail } from './useAuditTrail';

export interface EnhancedActivityLog {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  description: string;
  metadata: any;
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
  const { logCustomAuditEvent } = useAuditTrail();

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
      console.log('Fetching enhanced activity logs for user:', user.id);
      
      // Fetch regular activity logs
      const { data: activityData, error: activityError } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (activityError) throw activityError;

      let enhancedLogs: EnhancedActivityLog[] = activityData?.map(log => ({
        ...log,
        compliance_level: getComplianceLevel(log.entity_type, log.action),
        risk_score: calculateRiskScore(log.entity_type, log.action)
      })) || [];

      // Include audit trail data if requested
      if (includeAudit) {
        const { data: auditData, error: auditError } = await supabase
          .from('audit_trail')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(limit / 2); // Get fewer audit records to balance

        if (!auditError && auditData) {
          const auditLogs: EnhancedActivityLog[] = auditData.map(audit => ({
            id: audit.id,
            user_id: audit.user_id,
            action: audit.action,
            entity_type: audit.table_name,
            entity_id: audit.record_id,
            description: `${audit.action} operation on ${audit.table_name}`,
            metadata: {
              old_values: audit.old_values,
              new_values: audit.new_values,
              changed_fields: audit.changed_fields,
              ip_address: audit.ip_address,
              user_agent: audit.user_agent
            },
            created_at: audit.created_at,
            compliance_level: audit.compliance_level,
            audit_trail_id: audit.id,
            risk_score: getAuditRiskScore(audit.compliance_level, audit.action)
          }));

          // Merge and sort by date
          enhancedLogs = [...enhancedLogs, ...auditLogs]
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, limit);
        }
      }

      setLogs(enhancedLogs);
      console.log(`Successfully fetched ${enhancedLogs.length} enhanced activity logs`);
    } catch (error: any) {
      console.error('Error fetching enhanced activity logs:', error);
      setError(error);
      toast.error('Failed to fetch activity logs');
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
    metadata?: any,
    includeAuditTrail: boolean = true
  ) => {
    if (!validateUserAndSession()) return null;

    try {
      console.log('Logging enhanced activity:', { action, entityType, entityId, description });
      
      // Log to activity_logs table
      const { data: activityData, error: activityError } = await supabase
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

      if (activityError) throw activityError;

      // Also log to audit trail if requested
      if (includeAuditTrail) {
        await logCustomAuditEvent(entityType, entityId, action, description, metadata);
      }

      // Create enhanced log entry
      const enhancedLog: EnhancedActivityLog = {
        ...activityData,
        compliance_level: getComplianceLevel(entityType, action),
        risk_score: calculateRiskScore(entityType, action)
      };

      setLogs(prev => [enhancedLog, ...prev.slice(0, limit - 1)]);
      console.log('Enhanced activity logged successfully:', enhancedLog);
      return enhancedLog;
    } catch (error: any) {
      console.error('Error logging enhanced activity:', error);
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

  const getAuditRiskScore = (complianceLevel: string, action: string): number => {
    let score = 0;
    
    switch (complianceLevel) {
      case 'critical':
        score = 90;
        break;
      case 'high':
        score = 60;
        break;
      default:
        score = 30;
    }

    if (action === 'DELETE') {
      score += 10;
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
