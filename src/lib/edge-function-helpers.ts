import { cacheService, TTL } from './cache';

interface CacheConfig {
  ttl?: number;
  staleWhileRevalidate?: number;
  cacheControl?: string;
}

interface EdgeFunctionResponse<T> {
  data: T | null;
  error: Error | null;
  headers: Record<string, string>;
}

type ParamValue = string | number | boolean | null | undefined | Record<string, any>;
type RequestParams = Record<string, ParamValue>;

/**
 * Helper function to handle caching and headers for Edge Functions
 * @param key Cache key
 * @param fetchData Function to fetch data if not in cache
 * @param config Cache configuration
 */
export async function withCache<T>(
  key: string,
  fetchData: () => Promise<T>,
  config: CacheConfig = {}
): Promise<EdgeFunctionResponse<T>> {
  const {
    ttl = TTL.MEDIUM,
    staleWhileRevalidate = TTL.LONG,
    cacheControl = `public, max-age=${ttl}, stale-while-revalidate=${staleWhileRevalidate}`
  } = config;

  try {
    // Try to get from cache
    const cached = cacheService.get<T>(key);
    if (cached) {
      return {
        data: cached,
        error: null,
        headers: {
          'Cache-Control': cacheControl,
          'X-Cache': 'HIT'
        }
      };
    }

    // Fetch fresh data
    const data = await fetchData();

    // Cache the result
    cacheService.set(key, data, ttl);

    return {
      data,
      error: null,
      headers: {
        'Cache-Control': cacheControl,
        'X-Cache': 'MISS'
      }
    };
  } catch (error) {
    return {
      data: null,
      error: error as Error,
      headers: {
        'Cache-Control': 'no-store',
        'X-Cache': 'ERROR'
      }
    };
  }
}

/**
 * Helper function to generate cache key based on request parameters
 * @param baseKey Base cache key
 * @param params Request parameters
 */
export function generateCacheKey(baseKey: string, params: RequestParams = {}): string {
  const sortedParams = Object.keys(params)
    .sort()
    .reduce((acc, key) => {
      acc[key] = params[key];
      return acc;
    }, {} as RequestParams);

  return `${baseKey}:${JSON.stringify(sortedParams)}`;
}

/**
 * Helper function to invalidate cache entries by prefix
 * @param prefix Cache key prefix to invalidate
 */
export function invalidateCacheByPrefix(prefix: string): void {
  const keys = cacheService.getKeys();
  keys.forEach(key => {
    if (key.startsWith(prefix)) {
      cacheService.delete(key);
    }
  });
}

/**
 * Helper function to set CORS headers
 * @param origin Allowed origin
 */
export function getCorsHeaders(origin: string = '*'): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400'
  };
}

/**
 * Helper function to combine multiple header objects
 * @param headers Array of header objects
 */
export function combineHeaders(...headers: Record<string, string>[]): Record<string, string> {
  return headers.reduce((acc, curr) => ({ ...acc, ...curr }), {});
}

/**
 * Helper function to validate request parameters
 * @param params Parameters to validate
 * @param requiredFields Required field names
 */
export function validateParams(
  params: RequestParams,
  requiredFields: string[]
): { isValid: boolean; missingFields: string[] } {
  const missingFields = requiredFields.filter(field => !params[field]);
  return {
    isValid: missingFields.length === 0,
    missingFields
  };
}
