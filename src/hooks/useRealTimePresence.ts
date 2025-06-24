import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useCallback, useEffect, useState } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';

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
}

const isValidUserStatus = (status: string): status is UserStatus => {
  return ['online', 'away', 'busy', 'offline'].includes(status);
};

const isValidPresence = (presence: unknown): presence is UserPresence => {
  if (!presence || typeof presence !== 'object') return false;
  const obj = presence as Record<string, unknown>;
  return (
    'user_id' in obj && typeof obj.user_id === 'string' &&
    'status' in obj && typeof obj.status === 'string' && isValidUserStatus(obj.status) &&
    'last_seen' in obj && typeof obj.last_seen === 'string' &&
    (!('username' in obj) || typeof obj.username === 'string') &&
    (!('current_page' in obj) || typeof obj.current_page === 'string') &&
    (!('metadata' in obj) || (typeof obj.metadata === 'object' && obj.metadata !== null))
  );
};

export const useRealTimePresence = (roomId: string = 'main'): UseRealTimePresenceReturn => {
  const { user } = useAuth();
  const [presenceState, setPresenceState] = useState<Record<string, UserPresence[]>>({});
  const [onlineUsers, setOnlineUsers] = useState<UserPresence[]>([]);
  const [myPresence, setMyPresence] = useState<UserPresence | null>(null);

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

    const channel = supabase.channel(`presence_${roomId}`);
    await channel.track(newPresence);
  }, [user, roomId]);

  useEffect(() => {
    if (!user) return;

    let channel: RealtimeChannel | null = null;

    const setupPresence = async () => {
      channel = supabase.channel(`presence_${roomId}`)
        .on('presence', { event: 'sync' }, () => {
          if (!channel) return;
          const newState = channel.presenceState();

          // Convert Supabase presence state to our format safely
          const convertedState: Record<string, UserPresence[]> = {};
          Object.entries(newState).forEach(([key, presences]) => {
            // Filter and validate presence objects
            const validPresences = (presences as unknown[])
              .filter(isValidPresence);

            if (validPresences.length > 0) {
              convertedState[key] = validPresences;
            }
          });

          setPresenceState(convertedState);

          // Flatten presence state to get all online users
          const users = Object.values(convertedState).flat();
          setOnlineUsers(users);
        })
        .on('presence', { event: 'join' }, ({ key, newPresences }) => {
          // User joined presence channel
          const validPresences = (newPresences as unknown[])
            .filter(isValidPresence);

          if (validPresences.length > 0) {
            setPresenceState(prev => ({
              ...prev,
              [key]: validPresences
            }));
            setOnlineUsers(prev => [...prev, ...validPresences]);
          }
        })
        .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
          // User left presence channel
          const validPresences = (leftPresences as unknown[])
            .filter(isValidPresence);

          if (validPresences.length > 0) {
            setPresenceState(prev => {
              const newState = { ...prev };
              delete newState[key];
              return newState;
            });
            setOnlineUsers(prev => prev.filter(user =>
              !validPresences.some(presence => presence.user_id === user.user_id)
            ));
          }
        })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            await updatePresence({ status: 'online' });
          }
        });
    };

    setupPresence();

    // Update presence on page visibility change
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        updatePresence({ status: 'online' });
      } else {
        updatePresence({ status: 'away' });
      }
    };

    // Update presence on page navigation
    const handleBeforeUnload = () => {
      if (channel) {
        updatePresence({ status: 'offline' });
        supabase.removeChannel(channel);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Periodic presence update (every 30 seconds)
    const presenceInterval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        updatePresence({});
      }
    }, 30000);

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      clearInterval(presenceInterval);
    };
  }, [user, roomId, updatePresence]);

  return {
    presenceState,
    onlineUsers,
    myPresence,
    updatePresence
  };
};
