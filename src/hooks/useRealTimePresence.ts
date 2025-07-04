
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface UserPresence {
  user_id: string;
  username?: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  last_seen: string;
  current_page?: string;
}

export const useRealTimePresence = (roomId: string = 'main') => {
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
      ...updates
    };

    setMyPresence(newPresence);

    const channel = supabase.channel(`presence_${roomId}`);
    await channel.track(newPresence);
  }, [user, roomId]);

  useEffect(() => {
    if (!user) return;

    const channel = supabase.channel(`presence_${roomId}`)
      .on('presence', { event: 'sync' }, () => {
        const newState = channel.presenceState();
        
        // Convert Supabase presence state to our format safely
        const convertedState: Record<string, UserPresence[]> = {};
        Object.entries(newState).forEach(([key, presences]) => {
          // Filter and validate presence objects
          const validPresences = (presences as any[]).filter((presence: any) => 
            presence && 
            typeof presence === 'object' && 
            'user_id' in presence && 
            'status' in presence && 
            'last_seen' in presence
          ) as UserPresence[];
          
          if (validPresences.length > 0) {
            convertedState[key] = validPresences;
          }
        });
        
        setPresenceState(convertedState);
        
        // Flatten presence state to get all online users
        const users = Object.values(convertedState).flat();
        setOnlineUsers(users);
        console.log('Presence sync:', users);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await updatePresence({ status: 'online' });
        }
      });

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
      updatePresence({ status: 'offline' });
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
      supabase.removeChannel(channel);
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
