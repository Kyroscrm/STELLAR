import React from 'react';
import { Button } from '@/components/ui/button';

const EmergencyStop = () => {
  const handleStop = () => {
    // Force reload to stop all ongoing requests
    window.location.reload();
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      <Button
        onClick={handleStop}
        variant="destructive"
        size="sm"
        className="bg-red-600 hover:bg-red-700 text-white font-bold"
      >
        🚨 Emergency Stop - Reload Page
      </Button>
    </div>
  );
};

export default EmergencyStop;
