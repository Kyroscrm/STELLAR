import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useErrorHandler } from './useErrorHandler';
import { useRBAC } from './useRBAC';
import { useEnhancedActivityLogs } from './useEnhancedActivityLogs';

export type RetentionPolicyType = 'automatic' | 'manual' | 'legal_hold';

export interface DataRetentionPolicy {
  id: string;
  table_name: string;
  retention_period_days: number;
  policy_type: RetentionPolicyType;
  compliance_requirement: string | null;
  auto_delete: boolean;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface RetentionReport {
  table_name: string;
  total_records: number;
  eligible_for_deletion: number;
  oldest_record_date: string | null;
  policy_applied: boolean;
  last_cleanup_date: string | null;
}

export const useDataRetention = () => {
  const [policies, setPolicies] = useState<DataRetentionPolicy[]>([]);
  const [reports, setReports] = useState<RetentionReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();
  const { handleError } = useErrorHandler();
  const { hasPermission } = useRBAC();
  const { logEntityChange } = useEnhancedActivityLogs();

  const canManageRetention = hasPermission('retention:manage');
  const canViewRetention = hasPermission('retention:read');

  const validateUserAndSession = () => {
    if (!user) {
      const errorMsg = 'Authentication required. Please log in again.';
      setError(new Error(errorMsg));
      toast.error(errorMsg);
      return false;
    }
    return true;
  };

  const fetchPolicies = async () => {
    if (!validateUserAndSession() || !canViewRetention) return;

    setLoading(true);
    setError(null);
    try {
      // Check if data_retention_policies table exists, if not create it
      const { data, error } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .eq('table_name', 'data_retention_policies');

      if (!data || data.length === 0) {
        // Create the table if it doesn't exist
        await createRetentionPoliciesTable();
      }

      // Fetch policies
      const { data: policiesData, error: policiesError } = await supabase
        .from('data_retention_policies')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (policiesError) throw policiesError;

      setPolicies(policiesData || []);
    } catch (error: unknown) {
      const retentionError = error instanceof Error ? error : new Error('Failed to fetch retention policies');
      setError(retentionError);
      handleError(retentionError, { title: 'Failed to fetch retention policies' });
      setPolicies([]);
    } finally {
      setLoading(false);
    }
  };

  const createRetentionPoliciesTable = async () => {
    const { error } = await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.data_retention_policies (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          table_name TEXT UNIQUE NOT NULL,
          retention_period_days INTEGER NOT NULL DEFAULT 365,
          policy_type TEXT NOT NULL DEFAULT 'automatic' CHECK (policy_type IN ('automatic', 'manual', 'legal_hold')),
          compliance_requirement TEXT,
          auto_delete BOOLEAN DEFAULT false,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
        );

        -- Create RLS policies
        ALTER TABLE public.data_retention_policies ENABLE ROW LEVEL SECURITY;

        CREATE POLICY "Users can view their retention policies" ON public.data_retention_policies
          FOR SELECT USING (auth.uid() = user_id);

        CREATE POLICY "Users can manage their retention policies" ON public.data_retention_policies
          FOR ALL USING (auth.uid() = user_id);

        -- Create default policies for common tables
        INSERT INTO public.data_retention_policies (table_name, retention_period_days, policy_type, compliance_requirement, user_id)
        VALUES
          ('activity_logs', 2555, 'automatic', 'Audit logs retention for 7 years', auth.uid()),
          ('leads', 1095, 'automatic', 'Lead data retention for 3 years', auth.uid()),
          ('customers', 2555, 'manual', 'Customer data retention for 7 years', auth.uid()),
          ('jobs', 2190, 'manual', 'Job records retention for 6 years', auth.uid()),
          ('invoices', 2555, 'legal_hold', 'Financial records retention for 7 years', auth.uid()),
          ('estimates', 1095, 'automatic', 'Estimate retention for 3 years', auth.uid())
        ON CONFLICT (table_name) DO NOTHING;
      `
    });

    if (error) throw error;
  };

  const createPolicy = async (policyData: Omit<DataRetentionPolicy, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
    if (!validateUserAndSession() || !canManageRetention) return null;

    try {
      const { data, error } = await supabase
        .from('data_retention_policies')
        .insert({
          ...policyData,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      setPolicies(prev => [data, ...prev]);

      // Enhanced activity logging
      await logEntityChange(
        'data_retention_policy',
        data.id,
        'created',
        null,
        data,
        `Data retention policy created for table: ${data.table_name}`
      );

      toast.success('Retention policy created successfully');
      return data;
    } catch (error: unknown) {
      const createError = error instanceof Error ? error : new Error('Failed to create retention policy');
      handleError(createError, { title: 'Failed to create retention policy' });
      return null;
    }
  };

  const updatePolicy = async (id: string, updates: Partial<DataRetentionPolicy>) => {
    if (!validateUserAndSession() || !canManageRetention) return false;

    const originalPolicy = policies.find(p => p.id === id);
    if (!originalPolicy) {
      toast.error('Policy not found');
      return false;
    }

    try {
      const { data, error } = await supabase
        .from('data_retention_policies')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      setPolicies(prev => prev.map(p => p.id === id ? data : p));

      // Enhanced activity logging
      await logEntityChange(
        'data_retention_policy',
        id,
        'updated',
        originalPolicy,
        data,
        `Data retention policy updated for table: ${data.table_name}`
      );

      toast.success('Retention policy updated successfully');
      return true;
    } catch (error: unknown) {
      const updateError = error instanceof Error ? error : new Error('Failed to update retention policy');
      handleError(updateError, { title: 'Failed to update retention policy' });
      return false;
    }
  };

  const deletePolicy = async (id: string) => {
    if (!validateUserAndSession() || !canManageRetention) return;

    const originalPolicy = policies.find(p => p.id === id);
    if (!originalPolicy) {
      toast.error('Policy not found');
      return;
    }

    try {
      const { error } = await supabase
        .from('data_retention_policies')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setPolicies(prev => prev.filter(p => p.id !== id));

      // Enhanced activity logging
      await logEntityChange(
        'data_retention_policy',
        id,
        'deleted',
        originalPolicy,
        null,
        `Data retention policy deleted for table: ${originalPolicy.table_name}`
      );

      toast.success('Retention policy deleted successfully');
    } catch (error: unknown) {
      const deleteError = error instanceof Error ? error : new Error('Failed to delete retention policy');
      handleError(deleteError, { title: 'Failed to delete retention policy' });
    }
  };

  const generateRetentionReport = async () => {
    if (!validateUserAndSession() || !canViewRetention) return;

    setLoading(true);
    try {
      // Generate reports for each table with retention policies
      const reportPromises = policies.map(async (policy) => {
        try {
          // Get table statistics
          const { data: tableStats, error: statsError } = await supabase.rpc('get_table_retention_stats', {
            p_table_name: policy.table_name,
            p_retention_days: policy.retention_period_days,
            p_user_id: user.id
          });

          if (statsError) {
            // Handle stats error silently - return default report structure
            return {
              table_name: policy.table_name,
              total_records: 0,
              eligible_for_deletion: 0,
              oldest_record_date: null,
              policy_applied: true,
              last_cleanup_date: null
            };
          }

          return tableStats;
        } catch (error) {
          return {
            table_name: policy.table_name,
            total_records: 0,
            eligible_for_deletion: 0,
            oldest_record_date: null,
            policy_applied: false,
            last_cleanup_date: null
          };
        }
      });

      const reportResults = await Promise.all(reportPromises);
      setReports(reportResults);

      toast.success('Retention report generated successfully');
    } catch (error: unknown) {
      const reportError = error instanceof Error ? error : new Error('Failed to generate retention report');
      handleError(reportError, { title: 'Failed to generate retention report' });
    } finally {
      setLoading(false);
    }
  };

  const executeCleanup = async (tableName: string, dryRun: boolean = true) => {
    if (!validateUserAndSession() || !canManageRetention) return;

    const policy = policies.find(p => p.table_name === tableName);
    if (!policy) {
      toast.error('No retention policy found for this table');
      return;
    }

    if (policy.policy_type === 'legal_hold') {
      toast.error('Cannot cleanup data under legal hold');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('execute_data_cleanup', {
        p_table_name: tableName,
        p_retention_days: policy.retention_period_days,
        p_user_id: user.id,
        p_dry_run: dryRun
      });

      if (error) throw error;

      if (dryRun) {
        toast.info(`Dry run completed: ${data.records_would_be_deleted} records would be deleted`);
      } else {
        toast.success(`Cleanup completed: ${data.records_deleted} records deleted`);

        // Log the cleanup action
        await logEntityChange(
          'data_cleanup',
          policy.id,
          'executed',
          null,
          { records_deleted: data.records_deleted, table_name: tableName },
          `Data cleanup executed for ${tableName}: ${data.records_deleted} records deleted`
        );
      }

      // Refresh the report
      await generateRetentionReport();
    } catch (error: unknown) {
      const cleanupError = error instanceof Error ? error : new Error('Failed to execute cleanup');
      handleError(cleanupError, { title: 'Failed to execute data cleanup' });
    } finally {
      setLoading(false);
    }
  };

  const scheduleAutomaticCleanup = async (enabled: boolean) => {
    if (!validateUserAndSession() || !canManageRetention) return;

    try {
      // This would typically call an edge function to set up a scheduled job
      const { error } = await supabase.rpc('schedule_automatic_cleanup', {
        p_user_id: user.id,
        p_enabled: enabled
      });

      if (error) throw error;

      toast.success(`Automatic cleanup ${enabled ? 'enabled' : 'disabled'}`);
    } catch (error: unknown) {
      const scheduleError = error instanceof Error ? error : new Error('Failed to schedule automatic cleanup');
      handleError(scheduleError, { title: 'Failed to schedule automatic cleanup' });
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, [user]);

  return {
    policies,
    reports,
    loading,
    error,
    canManageRetention,
    canViewRetention,
    fetchPolicies,
    createPolicy,
    updatePolicy,
    deletePolicy,
    generateRetentionReport,
    executeCleanup,
    scheduleAutomaticCleanup
  };
};
