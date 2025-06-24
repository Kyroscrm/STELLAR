import { useCallback } from 'react';
import { toast } from 'sonner';

interface ErrorHandlerOptions {
  title?: string;
  showToast?: boolean;
  logError?: boolean;
  retryAction?: () => void;
  fallbackMessage?: string;
}

export const useErrorHandler = () => {
  const handleError = useCallback((
    error: Error | unknown,
    options: ErrorHandlerOptions = {}
  ) => {
    const {
      title = 'Error',
      showToast = true,
      logError = true,
      retryAction,
      fallbackMessage = 'An unexpected error occurred'
    } = options;

    // Log error for debugging (handled by error boundary)
    if (logError) {
      // Error logging is handled by error boundary or external service
    }

    // Extract error information for improved handling
    let errorMessage = fallbackMessage;

    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    } else if (error && typeof error === 'object' && 'message' in error) {
      errorMessage = (error as { message: string }).message;
    }

    // Handle specific Supabase errors
    if (error && typeof error === 'object' && 'code' in error) {
      const supabaseError = error as { code: string; message?: string };
      switch (supabaseError.code) {
        case 'PGRST116':
          errorMessage = 'No data found or access denied';
          break;
        case '23505':
          errorMessage = 'This record already exists';
          break;
        case '23503':
          errorMessage = 'Cannot delete - record is being used elsewhere';
          break;
        case '42501':
          errorMessage = 'Permission denied';
          break;
        default:
          errorMessage = supabaseError.message || fallbackMessage;
      }
    }

    // Show toast notification
    if (showToast) {
      if (retryAction) {
        toast.error(title, {
          description: errorMessage,
          duration: 8000,
          action: {
            label: 'Retry',
            onClick: retryAction
          }
        });
      } else {
        toast.error(title, {
          description: errorMessage,
          duration: 5000,
        });
      }
    }

    return errorMessage;
  }, []);

  const handleAsyncError = useCallback(async (
    asyncOperation: () => Promise<any>,
    options: ErrorHandlerOptions = {}
  ) => {
    try {
      return await asyncOperation();
    } catch (error) {
      handleError(error, options);
      throw error; // Re-throw to allow caller to handle if needed
    }
  }, [handleError]);

  return {
    handleError,
    handleAsyncError
  };
};
