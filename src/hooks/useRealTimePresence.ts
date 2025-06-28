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

// Temporarily simplified version to fix React Hooks ordering violation
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
    // Temporarily disabled real-time tracking to fix hooks ordering
  }, [user]);

  // Temporarily disabled real-time effects to fix React Hooks ordering violation
  useEffect(() => {
    if (user) {
      // Just set basic presence without real-time features
      updatePresence({ status: 'online' });
    }
  }, [user, updatePresence]);

  return {
    presenceState,
    onlineUsers,
    myPresence,
    updatePresence
  };
};
