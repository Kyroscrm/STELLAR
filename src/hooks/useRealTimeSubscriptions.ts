
import { useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface SubscriptionConfig {
  table: string;
  event: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  filter?: string;
  onUpdate: (payload: any) => void;
}

export const useRealTimeSubscriptions = (configs: SubscriptionConfig[]) => {
  const { user } = useAuth();
  const channelsRef = useRef<any[]>([]);

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
        onUpdate: (payload: any) => {
          console.log('New audit record:', payload);
          // Show notification for critical compliance events
          if (payload.new?.compliance_level === 'critical') {
            toast.warning(`Critical action logged: ${payload.new.action} on ${payload.new.table_name}`);
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
            console.log(`Real-time update on ${config.table}:`, payload);
            config.onUpdate(payload);
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log(`Subscribed to ${channelName}`);
          } else if (status === 'CHANNEL_ERROR') {
            console.error(`Error subscribing to ${channelName}`);
            toast.error(`Failed to connect to real-time updates for ${config.table}`);
          }
        });

      channelsRef.current.push(channel);
    });

    return cleanup;
  }, [user, configs, cleanup]);

  return { cleanup };
};
