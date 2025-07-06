import { useState, useCallback } from 'react';
import { useErrorHandler } from './useErrorHandler';
import { useToast } from './use-toast';

interface MutationOptions<TData, TVariables> {
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: Error, variables: TVariables) => void;
  onSettled?: (data: TData | undefined, error: Error | undefined, variables: TVariables) => void;
}

export const useApiMutation = <TData = unknown, TVariables = unknown>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: MutationOptions<TData, TVariables> = {}
) => {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<TData | undefined>(undefined);

  const { handleError } = useErrorHandler();
  const { toast } = useToast();
  const { onSuccess, onError, onSettled } = options;

  const mutate = useCallback(
    async (variables: TVariables) => {
      setIsPending(true);
      setError(null);
      setData(undefined);

      try {
        const result = await mutationFn(variables);
        setData(result);
        toast({ variant: 'default', title: 'Success', description: 'Operation completed successfully.' });
        if (onSuccess) {
          onSuccess(result, variables);
        }
        return result;
      } catch (e: unknown) {
        const error = e instanceof Error ? e : new Error('An unknown error occurred.');
        setError(error);
        handleError(error, { title: 'Operation Failed', description: error.message });
        if (onError) {
          onError(error, variables);
        }
        throw error;
      } finally {
        setIsPending(false);
        if (onSettled) {
          // This needs access to the final data and error state
          // A slight refactor might be needed if we want to pass final state here
          onSettled(data, error, variables);
        }
      }
    },
    [mutationFn, onSuccess, onError, onSettled, handleError, toast, data, error]
  );

  return { mutate, isPending, error, data };
};
