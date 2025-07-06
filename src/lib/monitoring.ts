import { supabase } from '../integrations/supabase/client';
import { toast } from '../hooks/use-toast';

// Error types for classification
export enum ErrorType {
  API_ERROR = 'API_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  AUTH_ERROR = 'AUTH_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR'
}

// Performance metrics interface
interface PerformanceMetrics {
  operation: string;
  duration: number;
  timestamp: Date;
  success: boolean;
  errorType?: ErrorType;
  details?: Record<string, unknown>;
}

// Initialize error count tracking
const errorCounts: Record<ErrorType, number> = {
  [ErrorType.API_ERROR]: 0,
  [ErrorType.DATABASE_ERROR]: 0,
  [ErrorType.AUTH_ERROR]: 0,
  [ErrorType.VALIDATION_ERROR]: 0,
  [ErrorType.NETWORK_ERROR]: 0
};

// Performance thresholds (in milliseconds)
const PERFORMANCE_THRESHOLDS = {
  DATABASE_QUERY: 1000, // 1 second
  API_REQUEST: 2000,    // 2 seconds
  AUTH_OPERATION: 3000  // 3 seconds
};

// Error threshold before alerting
const ERROR_THRESHOLD = 5;

/**
 * Track operation performance
 */
export const trackPerformance = async (metrics: PerformanceMetrics) => {
  try {
    // Log performance metrics to Supabase
    await supabase.from('performance_logs').insert({
      operation: metrics.operation,
      duration_ms: metrics.duration,
      timestamp: metrics.timestamp,
      success: metrics.success,
      error_type: metrics.errorType,
      details: metrics.details
    });

    // Check against thresholds
    if (metrics.duration > PERFORMANCE_THRESHOLDS.DATABASE_QUERY &&
        metrics.operation.includes('database')) {
      console.warn(`Slow database operation: ${metrics.operation} (${metrics.duration}ms)`);
    }

    // Track error counts
    if (!metrics.success && metrics.errorType) {
      errorCounts[metrics.errorType]++;

      // Alert if error threshold exceeded
      if (errorCounts[metrics.errorType] >= ERROR_THRESHOLD) {
        toast({
          title: 'System Alert',
          description: `Multiple ${metrics.errorType} errors detected`,
          variant: 'destructive'
        });
      }
    }
  } catch (error) {
    console.error('Failed to log performance metrics:', error);
  }
};

/**
 * Monitor database health
 */
export const checkDatabaseHealth = async () => {
  try {
    const startTime = Date.now();
    const { data, error } = await supabase.from('health_check').select('count');
    const duration = Date.now() - startTime;

    await trackPerformance({
      operation: 'database_health_check',
      duration,
      timestamp: new Date(),
      success: !error,
      errorType: error ? ErrorType.DATABASE_ERROR : undefined,
      details: { error: error?.message }
    });

    return !error;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
};

/**
 * Monitor authentication system
 */
export const checkAuthHealth = async () => {
  try {
    const startTime = Date.now();
    const { data: { session }, error } = await supabase.auth.getSession();
    const duration = Date.now() - startTime;

    await trackPerformance({
      operation: 'auth_health_check',
      duration,
      timestamp: new Date(),
      success: !error && !!session,
      errorType: error ? ErrorType.AUTH_ERROR : undefined,
      details: { error: error?.message }
    });

    return !error && !!session;
  } catch (error) {
    console.error('Auth health check failed:', error);
    return false;
  }
};

/**
 * Reset error counts periodically
 */
setInterval(() => {
  Object.keys(errorCounts).forEach(key => {
    errorCounts[key as ErrorType] = 0;
  });
}, 3600000); // Reset every hour

// Export monitoring functions
export const monitoring = {
  trackPerformance,
  checkDatabaseHealth,
  checkAuthHealth,
  ErrorType
};
