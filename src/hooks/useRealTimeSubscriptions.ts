import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useCallback, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { RealtimeChannel, RealtimePostgresChangesPayload, REALTIME_POSTGRES_CHANGES_LISTEN_EVENT } from '@supabase/supabase-js';

export type RealtimeEvent = 'INSERT' | 'UPDATE' | 'DELETE' | '*';

interface AuditTrailRecord {
  id: string;
  user_id: string;
  table_name: string;
  action: string;
  compliance_level: string;
  created_at: string;
}

export interface SubscriptionConfig<T = unknown> {
  table: string;
  event: RealtimeEvent;
  filter?: string;
  onUpdate: (payload: RealtimePostgresChangesPayload<T>) => void;
}

interface UseRealTimeSubscriptionsReturn {
  cleanup: () => void;
}

export const useRealTimeSubscriptions = <T = unknown>(configs: SubscriptionConfig<T>[]): UseRealTimeSubscriptionsReturn => {
  const { user } = useAuth();
  const channelsRef = useRef<RealtimeChannel[]>([]);

  const cleanup = useCallback(() => {
    channelsRef.current.forEach(channel => {
      supabase.removeChannel(channel);
    });
    channelsRef.current = [];
  }, []);

  useEffect(() => {
    if (!user || configs.length === 0) return;

    cleanup(); // Clean up existing channels

    // Add audit trail monitoring to all subscriptions
    const enhancedConfigs = [
      ...configs,
      {
        table: 'audit_trail',
        event: 'INSERT' as const,
        filter: `user_id=eq.${user.id}`,
        onUpdate: (payload: RealtimePostgresChangesPayload<AuditTrailRecord>) => {
          // Show notification for critical compliance events
          const newRecord = payload.new as AuditTrailRecord | null;
          if (newRecord?.compliance_level === 'critical') {
            toast.warning(`Critical action logged: ${newRecord.action} on ${newRecord.table_name}`);
          }
        }
      }
    ];

    enhancedConfigs.forEach((config, index) => {
      const channelName = `${config.table}_${config.event}_${user.id}_${index}`;

      const channel = supabase
        .channel(channelName)
        .on(
          REALTIME_POSTGRES_CHANGES_LISTEN_EVENT,
          {
            event: config.event,
            schema: 'public',
            table: config.table,
            filter: config.filter || `user_id=eq.${user.id}`
          },
          config.onUpdate
        )
        .subscribe((status) => {
          if (status === 'CHANNEL_ERROR') {
            toast.error(`Failed to connect to real-time updates for ${config.table}`);
          }
        });

      channelsRef.current.push(channel);
    });

    return cleanup;
  }, [user, configs, cleanup]);

  return { cleanup };
};
