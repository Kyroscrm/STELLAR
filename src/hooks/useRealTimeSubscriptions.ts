import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useCallback, useEffect, useRef } from 'react';
import { toast } from 'sonner';

interface SubscriptionConfig {
  table: string;
  event: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  filter?: string;
  onUpdate: (payload: unknown) => void;
}

export const useRealTimeSubscriptions = (configs: SubscriptionConfig[]) => {
  const { user } = useAuth();
  const channelsRef = useRef<unknown[]>([]);

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
        onUpdate: (payload: unknown) => {
          // Show notification for critical compliance events
          if (payload && typeof payload === 'object' && 'new' in payload) {
            const newRecord = (payload as any).new;
            if (newRecord?.compliance_level === 'critical') {
              toast.warning(`Critical action logged: ${newRecord.action} on ${newRecord.table_name}`);
            }
          }
        }
      }
    ];

    enhancedConfigs.forEach((config, index) => {
      const channelName = `${config.table}_${config.event}_${user.id}_${index}`;

      const channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes' as any,
          {
            event: config.event,
            schema: 'public',
            table: config.table,
            filter: config.filter || `user_id=eq.${user.id}`
          },
          (payload) => {
            config.onUpdate(payload);
          }
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
