
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useErrorHandler } from './useErrorHandler';

interface OptimisticUpdateOptions<T> {
  onSuccess?: (result: T) => void;
  onError?: (error: Error) => void;
  successMessage?: string;
  errorMessage?: string;
}

export function useOptimisticUpdate<T = unknown>() {
  const [isUpdating, setIsUpdating] = useState(false);
  const { handleError } = useErrorHandler();

  const executeUpdate = useCallback(async <TData>(
    optimisticUpdate: () => void,
    actualUpdate: () => Promise<TData>,
    rollback: () => void,
    options: OptimisticUpdateOptions<TData> = {}
  ) => {
    const {
      onSuccess,
      onError,
      successMessage = 'Update successful',
      errorMessage = 'Update failed'
    } = options;

    setIsUpdating(true);

    try {
      // Apply optimistic update immediately
      optimisticUpdate();

      // Perform actual update
      const result = await actualUpdate();

      // Show success message
      toast.success(successMessage);
      onSuccess?.(result);

      return result;
    } catch (error) {
      // Rollback optimistic update
      rollback();

      // Handle error
      handleError(error, {
        title: errorMessage,
        showToast: true,
        logError: true
      });

      onError?.(error as Error);
      throw error;
    } finally {
      setIsUpdating(false);
    }
  }, [handleError]);

  return {
    executeUpdate,
    isUpdating
  };
}
