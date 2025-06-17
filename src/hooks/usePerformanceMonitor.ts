
import { useEffect, useCallback } from 'react';

interface PerformanceMetrics {
  queryTime: number;
  renderTime: number;
  cacheHits: number;
  cacheMisses: number;
}

export const usePerformanceMonitor = (componentName: string) => {
  const startTime = performance.now();

  const measureQuery = useCallback((label: string) => {
    const start = performance.now();
    
    return {
      end: () => {
        const duration = performance.now() - start;
        console.log(`[${componentName}] ${label} took ${duration.toFixed(2)}ms`);
        return duration;
      }
    };
  }, [componentName]);

  const measureRender = useCallback(() => {
    const renderTime = performance.now() - startTime;
    if (renderTime > 16) { // Warn if render takes longer than 16ms (60fps threshold)
      console.warn(`[${componentName}] Slow render detected: ${renderTime.toFixed(2)}ms`);
    }
    return renderTime;
  }, [componentName, startTime]);

  // Log component mount/unmount
  useEffect(() => {
    console.log(`[${componentName}] Component mounted`);
    
    return () => {
      console.log(`[${componentName}] Component unmounted`);
    };
  }, [componentName]);

  return {
    measureQuery,
    measureRender
  };
};
