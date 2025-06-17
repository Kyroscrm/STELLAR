
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface RetryButtonProps {
  onRetry: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

export const RetryButton: React.FC<RetryButtonProps> = ({
  onRetry,
  loading = false,
  disabled = false,
  variant = 'outline',
  size = 'sm',
  className = ''
}) => {
  return (
    <Button
      onClick={onRetry}
      disabled={disabled || loading}
      variant={variant}
      size={size}
      className={className}
    >
      <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
      {loading ? 'Retrying...' : 'Retry'}
    </Button>
  );
};
