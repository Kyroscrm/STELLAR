
import { useState, useCallback } from 'react';
import { toast } from 'sonner';

interface ErrorState {
  error: Error | null;
  isError: boolean;
}

export const useErrorHandler = () => {
  const [errorState, setErrorState] = useState<ErrorState>({
    error: null,
    isError: false
  });

  const handleError = useCallback((error: Error | string, context?: string) => {
    const errorObj = typeof error === 'string' ? new Error(error) : error;
    
    console.error(`Error${context ? ` in ${context}` : ''}:`, errorObj);
    
    setErrorState({
      error: errorObj,
      isError: true
    });

    // Show user-friendly error message
    const message = errorObj.message.includes('fetch')
      ? 'Network error. Please check your connection and try again.'
      : errorObj.message || 'An unexpected error occurred';
    
    toast.error(message);
  }, []);

  const clearError = useCallback(() => {
    setErrorState({
      error: null,
      isError: false
    });
  }, []);

  const retryOperation = useCallback(async (operation: () => Promise<void>) => {
    try {
      clearError();
      await operation();
    } catch (error) {
      handleError(error as Error);
    }
  }, [handleError, clearError]);

  return {
    error: errorState.error,
    isError: errorState.isError,
    handleError,
    clearError,
    retryOperation
  };
};
