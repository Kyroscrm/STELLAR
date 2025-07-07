import { useAuth } from '@/contexts/AuthContextExports';
import { supabase } from '@/integrations/supabase/client';
import { useCallback, useEffect, useState } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { toast } from 'sonner';

export type UserStatus = 'online' | 'away' | 'busy' | 'offline';

export interface UserPresence {
  user_id: string;
  username?: string;
  status: UserStatus;
  last_seen: string;
  current_page?: string;
  metadata?: {
    browser?: string;
    os?: string;
    device?: string;
    [key: string]: unknown;
  };
}

interface UseRealTimePresenceReturn {
  presenceState: Record<string, UserPresence[]>;
  onlineUsers: UserPresence[];
  myPresence: UserPresence | null;
  updatePresence: (updates: Partial<UserPresence>) => Promise<void>;
  connected: boolean;
  retryCount: number;
}

export const useRealTimePresence = (roomId: string = 'main'): UseRealTimePresenceReturn => {
  const { user } = useAuth();
  const [presenceState, setPresenceState] = useState<Record<string, UserPresence[]>>({});
  const [onlineUsers, setOnlineUsers] = useState<UserPresence[]>([]);
  const [myPresence, setMyPresence] = useState<UserPresence | null>(null);
  const [connected, setConnected] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 5;
  const RETRY_DELAY = 2000; // 2 seconds

  const updatePresence = useCallback(async (updates: Partial<UserPresence>) => {
    if (!user) return;

    const newPresence: UserPresence = {
      user_id: user.id,
      username: user.email?.split('@')[0] || 'Unknown',
      status: 'online',
      last_seen: new Date().toISOString(),
      current_page: window.location.pathname,
      metadata: {
        browser: navigator.userAgent,
        os: navigator.platform,
        device: 'web'
      },
      ...updates
    };

    setMyPresence(newPresence);

    if (connected) {
      try {
        await supabase.channel(roomId).track(newPresence);
      } catch (error) {
        // Failed to update presence
      }
    }
  }, [user, connected, roomId]);

  useEffect(() => {
    if (!user) return;

    let isSubscribed = true;
    let retryTimeout: NodeJS.Timeout;

    const setupChannel = () => {
      const channel = supabase.channel(roomId)
        .on('presence', { event: 'sync' }, () => {
          if (!isSubscribed) return;
          const state = channel.presenceState() as Record<string, UserPresence[]>;
          setPresenceState(state);
          const users = Object.values(state).flatMap(arr => arr as UserPresence[]);
          setOnlineUsers(users);
        })
        .on('presence', { event: 'join' }, ({ key, newPresences }) => {
          if (!isSubscribed) return;
          setOnlineUsers(prev => [...prev, ...((newPresences as unknown) as UserPresence[])]);
        })
        .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
          if (!isSubscribed) return;
          const leftIds = ((leftPresences as unknown) as UserPresence[]).map(p => p.user_id);
          setOnlineUsers(prev => prev.filter(p => !leftIds.includes(p.user_id)));
        })
        .subscribe(async (status) => {
          if (!isSubscribed) return;

          if (status === 'SUBSCRIBED') {
            setConnected(true);
            setRetryCount(0);
            // Track initial presence
            if (myPresence) {
              try {
                await channel.track(myPresence);
              } catch (error) {
                /* Failed to track initial presence */
              }
            }
          } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
            setConnected(false);
            if (retryCount < MAX_RETRIES) {
              retryTimeout = setTimeout(() => {
                setRetryCount(prev => prev + 1);
                setupChannel();
              }, RETRY_DELAY * Math.pow(2, retryCount));
            } else {
              toast.error('Failed to connect to presence system. Some real-time features may be unavailable.');
            }
          }
        });

      return channel;
    };

    const channel = setupChannel();

    // Set initial presence
    updatePresence({ status: 'online' });

    return () => {
      isSubscribed = false;
      clearTimeout(retryTimeout);
      channel.untrack();
      supabase.removeChannel(channel);
      setConnected(false);
    };
  }, [user, roomId, retryCount]);

  return {
    presenceState,
    onlineUsers,
    myPresence,
    updatePresence,
    connected,
    retryCount
  };
};
