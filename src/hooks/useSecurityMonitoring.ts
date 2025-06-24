import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';
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

      const { data, error } = await supabase
        .from('user_activity')
        .select('*')
        .eq('user_id', user.id)
        .gte('timestamp', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .order('timestamp', { ascending: false });

      if (error) throw error;

      const metrics = calculateSecurityMetrics(data || []);
      setMetrics(metrics);
    } catch (error) {
      toast.error('Failed to fetch security metrics');
    } finally {
      setLoading(false);
    }
  };

  const checkForAnomalies = async () => {
    if (!validateUserAndSession()) return;

    try {

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
