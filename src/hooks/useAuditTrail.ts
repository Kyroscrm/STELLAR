
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface AuditRecord {
  id: string;
  user_id: string;
  table_name: string;
  record_id: string;
  action: 'INSERT' | 'UPDATE' | 'DELETE' | 'SELECT';
  old_values: any;
  new_values: any;
  changed_fields: string[];
  ip_address: string;
  user_agent: string;
  session_id: string;
  compliance_level: 'standard' | 'high' | 'critical';
  retention_period: string;
  created_at: string;
}

interface AuditFilters {
  table_name?: string;
  action?: string;
  compliance_level?: string;
  date_from?: string;
  date_to?: string;
  record_id?: string;
}

export const useAuditTrail = () => {
  const [auditRecords, setAuditRecords] = useState<AuditRecord[]>([]);
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

  const fetchAuditRecords = async (filters: AuditFilters = {}, limit: number = 100) => {
    if (!validateUserAndSession()) return;
    
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching audit records for user:', user.id);
      
      // Use activity logs as fallback since audit_trail table doesn't exist yet
      const { data: activityData, error: activityError } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (activityError) throw activityError;

      // Convert activity logs to audit record format
      const convertedRecords: AuditRecord[] = (activityData || []).map(log => ({
        id: log.id,
        user_id: log.user_id,
        table_name: log.entity_type,
        record_id: log.entity_id,
        action: log.action as any,
        old_values: null,
        new_values: log.metadata,
        changed_fields: [],
        ip_address: '',
        user_agent: '',
        session_id: '',
        compliance_level: getComplianceLevel(log.entity_type),
        retention_period: '7 years',
        created_at: log.created_at
      }));

      setAuditRecords(convertedRecords);
      console.log(`Successfully fetched ${convertedRecords.length} audit records`);
    } catch (error: any) {
      console.error('Error fetching audit records:', error);
      setError(error);
      toast.error('Failed to fetch audit records');
      setAuditRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const logCustomAuditEvent = async (
    tableName: string,
    recordId: string,
    action: string,
    description?: string,
    metadata?: any
  ) => {
    if (!validateUserAndSession()) return null;

    try {
      console.log('Logging custom audit event:', { tableName, recordId, action });
      
      // Use the existing log_activity function
      const { error } = await supabase.rpc('log_activity', {
        p_action: action,
        p_entity_type: tableName,
        p_entity_id: recordId,
        p_description: description || `${action} ${tableName}`,
        p_metadata: metadata || {}
      });

      if (error) throw error;
      
      console.log('Audit event logged successfully');
      return true;
    } catch (error: any) {
      console.error('Error logging custom audit event:', error);
      return null;
    }
  };

  const exportAuditRecords = async (filters: AuditFilters = {}) => {
    if (!validateUserAndSession()) return null;

    try {
      // Get all records for export
      const { data: allRecords } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!allRecords || allRecords.length === 0) {
        toast.error('No data to export');
        return false;
      }

      // Convert to CSV
      const headers = ['Date', 'Action', 'Entity Type', 'Entity ID', 'Description'];
      const csvContent = [
        headers.join(','),
        ...allRecords.map(record => [
          new Date(record.created_at).toLocaleString(),
          record.action,
          record.entity_type,
          record.entity_id,
          record.description || ''
        ].join(','))
      ].join('\n');

      // Download file
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-trail-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success('Audit trail exported successfully');
      return true;
    } catch (error: any) {
      console.error('Error exporting audit records:', error);
      toast.error('Failed to export audit records');
      return false;
    }
  };

  const getComplianceLevel = (entityType: string): 'standard' | 'high' | 'critical' => {
    if (['invoices', 'payments', 'signed_documents'].includes(entityType)) {
      return 'critical';
    }
    if (['customers', 'jobs', 'estimates'].includes(entityType)) {
      return 'high';
    }
    return 'standard';
  };

  useEffect(() => {
    if (user && session) {
      fetchAuditRecords();
    }
  }, [user, session]);

  return {
    auditRecords,
    loading,
    error,
    fetchAuditRecords,
    logCustomAuditEvent,
    exportAuditRecords
  };
};
