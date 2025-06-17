
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface SecurityAlert {
  id: string;
  type: 'suspicious_activity' | 'failed_login' | 'unusual_access' | 'data_breach';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  metadata: any;
  created_at: string;
}

export interface SecurityMetrics {
  totalAuditRecords: number;
  criticalActions: number;
  highRiskActions: number;
  recentLoginAttempts: number;
  suspiciousActivity: number;
  complianceScore: number;
}

export const useSecurityMonitoring = () => {
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null);
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

  const fetchSecurityMetrics = async () => {
    if (!validateUserAndSession()) return;

    setLoading(true);
    setError(null);
    try {
      console.log('Fetching security metrics for user:', user.id);

      // Get activity data for metrics
      const { data: activityData, error } = await supabase
        .from('activity_logs')
        .select('action, entity_type, created_at')
        .eq('user_id', user.id)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      if (error) throw error;

      // Calculate metrics from activity data
      const totalRecords = activityData?.length || 0;
      const criticalActions = activityData?.filter(r => 
        ['invoices', 'payments', 'signed_documents'].includes(r.entity_type)
      ).length || 0;
      const highRiskActions = activityData?.filter(r => 
        ['customers', 'jobs', 'estimates'].includes(r.entity_type) && r.action === 'DELETE'
      ).length || 0;
      
      // Calculate compliance score
      const complianceScore = Math.max(0, 100 - (criticalActions * 2) - (highRiskActions * 5));

      const calculatedMetrics: SecurityMetrics = {
        totalAuditRecords: totalRecords,
        criticalActions,
        highRiskActions,
        recentLoginAttempts: 1, // Current session
        suspiciousActivity: 0,
        complianceScore
      };

      setMetrics(calculatedMetrics);
      console.log('Security metrics calculated:', calculatedMetrics);
    } catch (error: any) {
      console.error('Error fetching security metrics:', error);
      setError(error);
      toast.error('Failed to fetch security metrics');
    } finally {
      setLoading(false);
    }
  };

  const checkForAnomalies = async () => {
    if (!validateUserAndSession()) return;

    try {
      console.log('Checking for security anomalies');

      // Get recent activity data
      const { data: recentData, error } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      const detectedAlerts: SecurityAlert[] = [];

      if (recentData) {
        // Check for high volume of actions
        if (recentData.length > 50) {
          detectedAlerts.push({
            id: `alert-${Date.now()}-1`,
            type: 'suspicious_activity',
            severity: 'medium',
            description: `High activity detected: ${recentData.length} actions in the last 24 hours`,
            metadata: { actionCount: recentData.length, timeframe: '24h' },
            created_at: new Date().toISOString()
          });
        }

        // Check for bulk delete operations
        const deleteCount = recentData.filter(r => r.action === 'DELETE').length;
        if (deleteCount > 3) {
          detectedAlerts.push({
            id: `alert-${Date.now()}-2`,
            type: 'data_breach',
            severity: 'high',
            description: `Multiple delete operations detected: ${deleteCount} records deleted`,
            metadata: { deleteCount, timeframe: '24h' },
            created_at: new Date().toISOString()
          });
        }
      }

      setAlerts(prev => [...detectedAlerts, ...prev.slice(0, 47)]);
      
      if (detectedAlerts.length > 0) {
        toast.warning(`${detectedAlerts.length} security alert(s) detected`);
      }

      console.log('Anomaly check completed:', detectedAlerts.length, 'alerts found');
      return detectedAlerts;
    } catch (error: any) {
      console.error('Error checking for anomalies:', error);
      return [];
    }
  };

  const dismissAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  useEffect(() => {
    if (user && session) {
      fetchSecurityMetrics();
      checkForAnomalies();
      
      // Set up periodic checks
      const interval = setInterval(() => {
        checkForAnomalies();
      }, 5 * 60 * 1000); // Check every 5 minutes

      return () => clearInterval(interval);
    }
  }, [user, session]);

  return {
    alerts,
    metrics,
    loading,
    error,
    fetchSecurityMetrics,
    checkForAnomalies,
    dismissAlert
  };
};
