
import { useState, useCallback } from 'react';

interface RetryConfig {
  maxAttempts?: number;
  delay?: number;
  backoff?: boolean;
}

export const useRetry = () => {
  const [isRetrying, setIsRetrying] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);

  const retry = useCallback(async <T>(
    operation: () => Promise<T>,
    config: RetryConfig = {}
  ): Promise<T> => {
    const { maxAttempts = 3, delay = 1000, backoff = true } = config;
    
    setIsRetrying(true);
    setAttemptCount(0);

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        setAttemptCount(attempt);
        const result = await operation();
        setIsRetrying(false);
        setAttemptCount(0);
        return result;
      } catch (error) {
        if (attempt === maxAttempts) {
          setIsRetrying(false);
          setAttemptCount(0);
          throw error;
        }

        // Calculate delay with exponential backoff
        const currentDelay = backoff ? delay * Math.pow(2, attempt - 1) : delay;
        await new Promise(resolve => setTimeout(resolve, currentDelay));
      }
    }

    throw new Error('Max retry attempts reached');
  }, []);

  return {
    retry,
    isRetrying,
    attemptCount
  };
};
