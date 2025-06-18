
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface AuditTrailEntry {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  description?: string;
  metadata?: any;
  created_at: string;
}

export const useAuditTrail = () => {
  const [activities, setActivities] = useState<AuditTrailEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  const fetchActivities = async () => {
    if (!user) {
      setActivities([]);
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      // If user is not admin, only show their own activities
      if (user.role !== 'admin') {
        query = query.eq('user_id', user.id);
      }

      const { data, error } = await query;

      if (error) throw error;
      setActivities(data || []);
      console.log(`Fetched ${data?.length || 0} activity log entries`);
    } catch (error: any) {
      console.error('Error fetching activity logs:', error);
      setError(error);
      toast.error('Failed to fetch activity logs');
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  const logActivity = async (
    action: string,
    entityType: string,
    entityId: string,
    description?: string,
    metadata?: any
  ) => {
    if (!user) return;

    try {
      const { error } = await supabase.from('activity_logs').insert({
        user_id: user.id,
        action,
        entity_type: entityType,
        entity_id: entityId,
        description,
        metadata: metadata || {}
      });

      if (error) throw error;
      
      // Refresh activities list
      await fetchActivities();
    } catch (error: any) {
      console.error('Error logging activity:', error);
      // Don't show toast for logging errors to avoid user disruption
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [user]);

  return {
    activities,
    loading,
    error,
    fetchActivities,
    logActivity
  };
};
