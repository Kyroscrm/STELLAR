
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, Users, Activity } from 'lucide-react';
import { useRealTimePresence } from '@/hooks/useRealTimePresence';
import { useRealTimeNotifications } from '@/hooks/useRealTimeNotifications';

const RealTimeStatusIndicator: React.FC = () => {
  const { onlineUsers } = useRealTimePresence();
  const { connected } = useRealTimeNotifications();

  return (
    <div className="flex items-center gap-2">
      {/* Connection Status */}
      <Badge 
        variant={connected ? "default" : "destructive"}
        className="flex items-center gap-1 text-xs"
      >
        {connected ? (
          <>
            <Wifi className="h-3 w-3" />
            Live
          </>
        ) : (
          <>
            <WifiOff className="h-3 w-3" />
            Offline
          </>
        )}
      </Badge>

      {/* Online Users Count */}
      {connected && onlineUsers.length > 0 && (
        <Badge variant="outline" className="flex items-center gap-1 text-xs">
          <Users className="h-3 w-3" />
          {onlineUsers.length} online
        </Badge>
      )}

      {/* Activity Indicator */}
      {connected && (
        <div className="flex items-center">
          <Activity className="h-3 w-3 text-green-500 animate-pulse" />
        </div>
      )}
    </div>
  );
};

export default RealTimeStatusIndicator;
