
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface ComplianceReport {
  id: string;
  user_id: string;
  report_type: string;
  date_range: string;
  filters: any;
  status: 'pending' | 'completed' | 'failed';
  file_path: string;
  generated_at: string;
  created_at: string;
}

interface ReportFilters {
  startDate: string;
  endDate: string;
  tables?: string[];
  complianceLevel?: string;
  actions?: string[];
}

export const useComplianceReports = () => {
  const [reports, setReports] = useState<ComplianceReport[]>([]);
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

  const fetchReports = async () => {
    if (!validateUserAndSession()) return;
    
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching compliance reports for user:', user.id);
      
      const { data, error } = await supabase
        .from('compliance_reports')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setReports(data || []);
      console.log(`Successfully fetched ${data?.length || 0} compliance reports`);
    } catch (error: any) {
      console.error('Error fetching compliance reports:', error);
      setError(error);
      toast.error('Failed to fetch compliance reports');
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async (reportType: string, filters: ReportFilters) => {
    if (!validateUserAndSession()) return null;

    try {
      console.log('Generating compliance report:', reportType, filters);
      
      // Create report record
      const { data: reportData, error: reportError } = await supabase
        .from('compliance_reports')
        .insert({
          user_id: user.id,
          report_type: reportType,
          date_range: `[${filters.startDate},${filters.endDate}]`,
          filters: filters,
          status: 'pending'
        })
        .select()
        .single();

      if (reportError) throw reportError;

      // Fetch audit data for the report
      let query = supabase
        .from('audit_trail')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', filters.startDate)
        .lte('created_at', filters.endDate)
        .order('created_at', { ascending: false });

      if (filters.tables && filters.tables.length > 0) {
        query = query.in('table_name', filters.tables);
      }
      if (filters.complianceLevel) {
        query = query.eq('compliance_level', filters.complianceLevel);
      }
      if (filters.actions && filters.actions.length > 0) {
        query = query.in('action', filters.actions);
      }

      const { data: auditData, error: auditError } = await query;
      if (auditError) throw auditError;

      // Generate report content
      const reportContent = generateReportContent(reportType, auditData, filters);
      
      // Update report status
      const { data: updatedReport, error: updateError } = await supabase
        .from('compliance_reports')
        .update({
          status: 'completed',
          generated_at: new Date().toISOString(),
          file_path: `reports/${reportData.id}.pdf`
        })
        .eq('id', reportData.id)
        .select()
        .single();

      if (updateError) throw updateError;

      // Download the report
      downloadReport(reportContent, `${reportType}-${new Date().toISOString().split('T')[0]}.csv`);

      setReports(prev => [updatedReport, ...prev.filter(r => r.id !== reportData.id)]);
      toast.success('Compliance report generated successfully');
      console.log('Compliance report generated successfully:', updatedReport);
      return updatedReport;
    } catch (error: any) {
      console.error('Error generating compliance report:', error);
      toast.error('Failed to generate compliance report');
      return null;
    }
  };

  const generateReportContent = (reportType: string, auditData: any[], filters: ReportFilters) => {
    const headers = [
      'Date',
      'Table',
      'Action',
      'Record ID',
      'Compliance Level',
      'Changed Fields',
      'User Agent',
      'IP Address'
    ];

    const rows = auditData.map(record => [
      new Date(record.created_at).toLocaleString(),
      record.table_name,
      record.action,
      record.record_id,
      record.compliance_level,
      record.changed_fields?.join(';') || '',
      record.user_agent || '',
      record.ip_address || ''
    ]);

    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  };

  const downloadReport = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const deleteReport = async (id: string) => {
    if (!validateUserAndSession()) return;

    try {
      console.log('Deleting compliance report:', id);
      
      const { error } = await supabase
        .from('compliance_reports')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      
      setReports(prev => prev.filter(r => r.id !== id));
      toast.success('Compliance report deleted successfully');
      console.log('Compliance report deleted successfully');
    } catch (error: any) {
      console.error('Error deleting compliance report:', error);
      toast.error('Failed to delete compliance report');
    }
  };

  useEffect(() => {
    if (user && session) {
      fetchReports();
    }
  }, [user, session]);

  return {
    reports,
    loading,
    error,
    fetchReports,
    generateReport,
    deleteReport
  };
};
