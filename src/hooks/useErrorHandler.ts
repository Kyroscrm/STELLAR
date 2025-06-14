
import { useCallback } from 'react';
import { toast } from 'sonner';

interface ErrorHandlerOptions {
  title?: string;
  showToast?: boolean;
  logError?: boolean;
}

export const useErrorHandler = () => {
  const handleError = useCallback((
    error: Error | unknown, 
    options: ErrorHandlerOptions = {}
  ) => {
    const {
      title = 'Error',
      showToast = true,
      logError = true
    } = options;

    // Log error for debugging
    if (logError) {
      console.error('Error handled:', error);
    }

    // Extract error message
    const errorMessage = error instanceof Error 
      ? error.message 
      : typeof error === 'string' 
      ? error 
      : 'An unexpected error occurred';

    // Show toast notification
    if (showToast) {
      toast.error(title, {
        description: errorMessage,
        duration: 5000,
      });
    }

    // In production, you would also send to error tracking service
    // Example: Sentry.captureException(error);

    return errorMessage;
  }, []);

  return { handleError };
};
