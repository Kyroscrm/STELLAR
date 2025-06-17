
import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ErrorDisplayProps {
  error: Error | null;
  onRetry?: () => void;
  title?: string;
  className?: string;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ 
  error, 
  onRetry, 
  title = "Something went wrong",
  className = ""
}) => {
  if (!error) return null;

  return (
    <Alert variant="destructive" className={className}>
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="mt-2">
        <p className="mb-3">{error.message}</p>
        {onRetry && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRetry}
            className="border-red-200 text-red-700 hover:bg-red-50"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
};

export default ErrorDisplay;
