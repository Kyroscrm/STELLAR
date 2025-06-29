import { useState } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../contexts/AuthContext';
import { useErrorHandler } from './useErrorHandler';
import { Json } from '../integrations/supabase/types';

export interface AuditRecord {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  timestamp: string;
  details: string;
  record_id?: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  description: string;
  old_data: Json;
  new_data: Json;
  changed_fields: string[];
  ip_address: string;
  user_agent: string;
  session_id: string;
  compliance_level: string;
  risk_score: number;
  created_at: string;
}

export interface FieldChangeHistory {
  log_id: string;
  user_id: string;
  old_value: Json;
  new_value: Json;
  changed_at: string;
}

export interface UseAuditTrailOptions {
  limit?: number;
  offset?: number;
}

export const useAuditTrail = () => {
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState<AuditRecord[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const { user, session } = useAuth();
  const { handleError } = useErrorHandler();

  const validateUserAndSession = () => {
    if (!user || !session) {
      throw new Error('Authentication required');
    }
  };

  const fetchAuditRecords = async (entityType?: string, entityId?: string) => {
    try {
      validateUserAndSession();
      setLoading(true);

      // Fetch audit records from Supabase
      const query = supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false });

      if (entityType) {
        query.eq('entity_type', entityType);
      }

      if (entityId) {
        query.eq('entity_id', entityId);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Map to AuditRecord interface
      const mappedRecords: AuditRecord[] = (data || []).map((record: AuditLog) => ({
        id: record.id,
        user_id: record.user_id,
        action: record.action,
        entity_type: record.entity_type,
        entity_id: record.entity_id,
        timestamp: record.created_at,
        details: record.description || '',
        record_id: record.entity_id
      }));

      setRecords(mappedRecords);
      return mappedRecords;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      return [];
    } finally {
      setLoading(false);
    }
  };

  const logCustomAuditEvent = async (
    action: string,
    entityType: string,
    entityId: string,
    description: string
  ) => {
    try {
      validateUserAndSession();
      setLoading(true);

      const { error } = await supabase.rpc('log_activity', {
        p_action: action,
        p_entity_type: entityType,
        p_entity_id: entityId,
        p_description: description,
        p_metadata: null,
        p_old_data: null,
        p_new_data: null,
        p_changed_fields: null,
        p_ip_address: null,
        p_user_agent: null,
        p_session_id: null,
        p_compliance_level: 'standard',
        p_risk_score: 0
      });

      if (error) throw error;

      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      return false;
    } finally {
      setLoading(false);
    }
  };

  const exportAuditRecords = async (format: 'csv' | 'json' = 'csv') => {
    try {
      validateUserAndSession();
      // Implementation would depend on your export mechanism
      // This is a placeholder
      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      return false;
    }
  };

  /**
   * Set request metadata for audit logging
   * @param ipAddress - Client IP address
   * @param userAgent - Client user agent
   * @param sessionId - User session ID
   */
  const setRequestMetadata = async (
    ipAddress?: string,
    userAgent?: string,
    sessionId?: string
  ): Promise<boolean> => {
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('set_request_metadata', {
        p_ip_address: ipAddress,
        p_user_agent: userAgent,
        p_session_id: sessionId,
      });

      if (error) throw error;
      return data as boolean;
    } catch (err) {
      handleError(err as Error, {
        title: 'Request Metadata Error',
        fallbackMessage: 'Failed to set request metadata'
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Clear request metadata
   */
  const clearRequestMetadata = async (): Promise<boolean> => {
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('clear_request_metadata');

      if (error) throw error;
      return data as boolean;
    } catch (err) {
      handleError(err as Error, {
        title: 'Request Metadata Error',
        fallbackMessage: 'Failed to clear request metadata'
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get audit logs for a specific entity
   * @param entityType - Type of entity (e.g., 'customers', 'invoices')
   * @param entityId - UUID of the entity
   * @param options - Query options (limit, offset)
   */
  const getEntityAuditLogs = async (
    entityType: string,
    entityId: string,
    options: UseAuditTrailOptions = {}
  ): Promise<AuditLog[]> => {
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('get_entity_audit_logs', {
        p_entity_type: entityType,
        p_entity_id: entityId,
        p_limit: options.limit || 100,
        p_offset: options.offset || 0,
      });

      if (error) throw error;
      return data as AuditLog[] || [];
    } catch (err) {
      handleError(err as Error, {
        title: 'Audit Log Error',
        fallbackMessage: `Failed to get audit logs for ${entityType} ${entityId}`
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get change history for a specific field of an entity
   * @param entityType - Type of entity (e.g., 'customers', 'invoices')
   * @param entityId - UUID of the entity
   * @param fieldName - Name of the field to get history for
   * @param limit - Maximum number of records to return
   */
  const getFieldChangeHistory = async (
    entityType: string,
    entityId: string,
    fieldName: string,
    limit: number = 20
  ): Promise<FieldChangeHistory[]> => {
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('get_field_change_history', {
        p_entity_type: entityType,
        p_entity_id: entityId,
        p_field_name: fieldName,
        p_limit: limit,
      });

      if (error) throw error;
      return data as FieldChangeHistory[] || [];
    } catch (err) {
      handleError(err as Error, {
        title: 'Field History Error',
        fallbackMessage: `Failed to get change history for ${fieldName} in ${entityType} ${entityId}`
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get activity logs for a user
   * @param userId - UUID of the user (optional, defaults to current user)
   * @param fromDate - Start date for filtering logs
   * @param toDate - End date for filtering logs
   * @param options - Query options (limit, offset)
   */
  const getUserActivity = async (
    userId?: string,
    fromDate?: string,
    toDate?: string,
    options: UseAuditTrailOptions = {}
  ): Promise<AuditLog[]> => {
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('get_user_activity', {
        p_user_id: userId,
        p_from_date: fromDate,
        p_to_date: toDate,
        p_limit: options.limit || 100,
        p_offset: options.offset || 0,
      });

      if (error) throw error;
      return data as AuditLog[] || [];
    } catch (err) {
      handleError(err as Error, {
        title: 'User Activity Error',
        fallbackMessage: 'Failed to get user activity logs'
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    records,
    error,
    fetchAuditRecords,
    logCustomAuditEvent,
    exportAuditRecords,
    setRequestMetadata,
    clearRequestMetadata,
    getEntityAuditLogs,
    getFieldChangeHistory,
    getUserActivity,
  };
};
