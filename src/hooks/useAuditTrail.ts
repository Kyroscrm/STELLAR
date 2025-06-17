
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
      
      let query = supabase
        .from('audit_trail')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      // Apply filters
      if (filters.table_name) {
        query = query.eq('table_name', filters.table_name);
      }
      if (filters.action) {
        query = query.eq('action', filters.action);
      }
      if (filters.compliance_level) {
        query = query.eq('compliance_level', filters.compliance_level);
      }
      if (filters.record_id) {
        query = query.eq('record_id', filters.record_id);
      }
      if (filters.date_from) {
        query = query.gte('created_at', filters.date_from);
      }
      if (filters.date_to) {
        query = query.lte('created_at', filters.date_to);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      setAuditRecords(data || []);
      console.log(`Successfully fetched ${data?.length || 0} audit records`);
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
      
      const { data, error } = await supabase
        .from('audit_trail')
        .insert({
          user_id: user.id,
          table_name: tableName,
          record_id: recordId,
          action: action,
          new_values: { description, metadata },
          compliance_level: 'standard'
        })
        .select()
        .single();

      if (error) throw error;
      
      // Update local state
      setAuditRecords(prev => [data, ...prev.slice(0, 99)]);
      console.log('Custom audit event logged successfully:', data);
      return data;
    } catch (error: any) {
      console.error('Error logging custom audit event:', error);
      return null;
    }
  };

  const exportAuditRecords = async (filters: AuditFilters = {}) => {
    if (!validateUserAndSession()) return null;

    try {
      const { data, error } = await supabase
        .from('audit_trail')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Convert to CSV
      const headers = ['Date', 'Table', 'Action', 'Record ID', 'Compliance Level', 'Changed Fields'];
      const csvContent = [
        headers.join(','),
        ...data.map(record => [
          new Date(record.created_at).toLocaleString(),
          record.table_name,
          record.action,
          record.record_id,
          record.compliance_level,
          record.changed_fields?.join(';') || ''
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
