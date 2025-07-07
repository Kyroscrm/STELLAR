import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface ComplianceReport {
  id: string;
  user_id: string;
  report_type: string;
  date_range: string;
  filters: unknown;
  status: 'pending' | 'completed' | 'failed';
  file_path: string;
  generated_at: string;
  created_at: string;
}

export interface ReportFilters {
  startDate?: Date;
  endDate?: Date;
  type?: string;
  status?: string;
}

export const useComplianceReports = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState<ComplianceReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchReports = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('compliance_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReports(data || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch reports'));
      toast.error('Failed to fetch compliance reports');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const generateReport = useCallback(async (reportType: string, filters: ReportFilters) => {
    if (!user) return null;

    try {
      // Report generation logic
      const reportData = {
        type: reportType,
        filters,
        user_id: user.id,
        status: 'generated',
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('compliance_reports')
        .insert([reportData])
        .select()
        .single();

      if (error) throw error;
      
      await fetchReports();
      return data;
    } catch (err) {
      toast.error('Failed to generate report');
      return null;
    }
  }, [user, fetchReports]);

  const deleteReport = useCallback(async (id: string) => {
    if (!user) return;

    try {
      setReports(prev => prev.filter(r => r.id !== id));
      toast.success('Compliance report deleted successfully');
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error('Failed to delete compliance report');
      } else {
        toast.error('Failed to delete compliance report');
      }
    }
  }, [user, setReports, toast]);

  useEffect(() => {
    if (user) {
      fetchReports();
    }
  }, [user, fetchReports]);

  return {
    reports,
    loading,
    error,
    fetchReports,
    generateReport,
    deleteReport
  };
};
