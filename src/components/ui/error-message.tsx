import React from 'react';
import { AlertTriangle, RefreshCw, AlertCircle, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type ErrorSeverity = 'error' | 'warning' | 'info';
type AlertVariant = 'default' | 'destructive';

interface ErrorMessageProps {
  message: string;
  title?: string;
  onRetry?: () => void;
  severity?: ErrorSeverity;
  className?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  title,
  onRetry,
  severity = 'error',
  className = ''
}) => {
  const getIcon = () => {
    switch (severity) {
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />;
      case 'info':
        return <Info className="h-4 w-4" />;
      case 'error':
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getVariant = (): AlertVariant => {
    return severity === 'error' ? 'destructive' : 'default';
  };

  const getBackgroundClass = () => {
    switch (severity) {
      case 'warning':
        return 'bg-yellow-50';
      case 'info':
        return 'bg-blue-50';
      case 'error':
      default:
        return 'bg-red-50';
    }
  };

  return (
    <Alert
      variant={getVariant()}
      className={cn(getBackgroundClass(), className)}
      role="alert"
      data-testid="error-message"
    >
      <div className="flex items-start">
        <div className="mr-2">{getIcon()}</div>
        <div className="flex-1">
          {title && <AlertTitle>{title}</AlertTitle>}
          <AlertDescription className="mt-1">{message}</AlertDescription>

          {onRetry && (
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={onRetry}
              data-testid="retry-button"
            >
              <RefreshCw className="h-3 w-3 mr-2" />
              Try Again
            </Button>
          )}
        </div>
      </div>
    </Alert>
  );
};

export default ErrorMessage;
