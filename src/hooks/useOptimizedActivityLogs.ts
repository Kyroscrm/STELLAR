import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ActivityLog {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  description: string;
  metadata: any;
  created_at: string;
}

interface ActivityLogFilters {
  entity_type?: string;
  action?: string;
  limit?: number;
  offset?: number;
}

export const useOptimizedActivityLogs = (filters: ActivityLogFilters = {}) => {
  const { user, session } = useAuth();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  const validateUserAndSession = useCallback(() => {
    if (!user || !session) {
      toast.error('Authentication required. Please log in again.');
      return false;
    }
    return true;
  }, [user, session]);

  // Optimized fetch with filters and pagination
  const fetchLogs = useCallback(async (filterObj: ActivityLogFilters = {}) => {
    if (!validateUserAndSession()) return;

    setLoading(true);
    try {
      console.log('Fetching optimized activity logs for user:', user.id, 'with filters:', filterObj);
      
      let query = supabase
        .from('activity_logs')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id);

      // Apply filters
      if (filterObj.entity_type) {
        query = query.eq('entity_type', filterObj.entity_type);
      }
      
      if (filterObj.action) {
        query = query.eq('action', filterObj.action);
      }

      // Apply pagination
      const limit = filterObj.limit || 50;
      if (filterObj.offset) {
        query = query.range(filterObj.offset, filterObj.offset + limit - 1);
      } else {
        query = query.limit(limit);
      }

      // Order by most recent first
      query = query.order('created_at', { ascending: false });

      const { data, error, count } = await query;

      if (error) throw error;
      
      if (filterObj.offset && filterObj.offset > 0) {
        // Append for pagination
        setLogs(prev => [...prev, ...(data || [])]);
      } else {
        // Replace for initial load or filters
        setLogs(data || []);
      }
      
      setTotalCount(count || 0);
      console.log(`Successfully fetched ${data?.length || 0} activity logs out of ${count || 0} total`);
    } catch (error: any) {
      console.error('Error fetching activity logs:', error);
      toast.error('Failed to fetch activity logs');
    } finally {
      setLoading(false);
    }
  }, [user, validateUserAndSession]);

  // Optimized background logging
  const logActivity = useCallback(async (
    action: string, 
    entityType: string, 
    entityId: string, 
    description?: string, 
    metadata?: any
  ) => {
    if (!validateUserAndSession()) return;

    // Create optimistic log entry
    const optimisticLog: ActivityLog = {
      id: `temp-${Date.now()}`,
      user_id: user.id,
      action,
      entity_type: entityType,
      entity_id: entityId,
      description: description || `${action} ${entityType}`,
      metadata: metadata || {},
      created_at: new Date().toISOString()
    };

    // Add to UI immediately if it matches current filters
    const matchesFilters = (!filters.entity_type || filters.entity_type === entityType) &&
                          (!filters.action || filters.action === action);
    
    if (matchesFilters) {
      setLogs(prev => [optimisticLog, ...prev.slice(0, 49)]);
      setTotalCount(prev => prev + 1);
    }

    try {
      console.log('Logging activity:', { action, entityType, entityId, description });
      
      const { data, error } = await supabase
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

      if (error) throw error;

      // Replace optimistic with real data
      if (matchesFilters) {
        setLogs(prev => prev.map(log => 
          log.id === optimisticLog.id ? data : log
        ));
      }

      console.log('Activity logged successfully:', data);
      return data;
    } catch (error: any) {
      console.error('Error logging activity:', error);
      
      // Remove optimistic entry on error
      if (matchesFilters) {
        setLogs(prev => prev.filter(log => log.id !== optimisticLog.id));
        setTotalCount(prev => prev - 1);
      }
      
      return null;
    }
  }, [user, validateUserAndSession, filters]);

  // Load more for pagination
  const loadMore = useCallback(async () => {
    if (loading || logs.length >= totalCount) return;
    
    const newFilters = { 
      ...filters, 
      offset: logs.length,
      limit: filters.limit || 50
    };
    
    await fetchLogs(newFilters);
  }, [loading, logs.length, totalCount, filters, fetchLogs]);

  // Initial fetch
  useEffect(() => {
    fetchLogs(filters);
  }, [user, session, filters]);

  // Enhanced real-time subscriptions with filter matching
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`activity_logs_realtime_${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'activity_logs',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Real-time activity log received:', payload);
          const newLog = payload.new as ActivityLog;
          
          // Enhanced filter matching
          const matchesFilters = (!filters.entity_type || filters.entity_type === newLog.entity_type) &&
                                (!filters.action || filters.action === newLog.action);
          
          if (matchesFilters) {
            setLogs(prev => {
              // Prevent duplicates and maintain order
              const exists = prev.some(log => log.id === newLog.id);
              if (exists) return prev;
              
              // Insert at beginning and maintain limit
              const updated = [newLog, ...prev];
              return updated.slice(0, filters.limit || 50);
            });
            
            // Update total count
            setTotalCount(prev => prev + 1);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'activity_logs',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const updatedLog = payload.new as ActivityLog;
          setLogs(prev => prev.map(log => log.id === updatedLog.id ? updatedLog : log));
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'activity_logs',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const deletedLog = payload.old as ActivityLog;
          setLogs(prev => prev.filter(log => log.id !== deletedLog.id));
          setTotalCount(prev => Math.max(0, prev - 1));
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Real-time activity logs subscription active');
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, filters]);

  return {
    logs,
    loading,
    totalCount,
    logActivity,
    fetchLogs,
    loadMore,
    hasMore: logs.length < totalCount
  };
};
