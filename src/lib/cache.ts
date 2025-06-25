import NodeCache from 'node-cache';

// Cache TTL values in seconds
export const TTL = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 3600, // 1 hour
  VERY_LONG: 86400, // 24 hours
} as const;

// Cache keys
export const CACHE_KEYS = {
  DASHBOARD_STATS: 'dashboardStats',
  LEAD_METRICS: 'leadMetrics',
  ESTIMATE_METRICS: 'estimateMetrics',
  MONTHLY_REVENUE: 'monthlyRevenue',
  ACTIVITY_LOGS: 'activityLogs',
  CUSTOMER_LIST: 'customerList',
  USER_PERMISSIONS: 'userPermissions',
} as const;

class CacheService {
  private static instance: CacheService;
  private cache: NodeCache;

  private constructor() {
    this.cache = new NodeCache({
      stdTTL: TTL.MEDIUM, // Default TTL
      checkperiod: 120, // Check for expired keys every 2 minutes
      useClones: false, // For better performance
    });
  }

  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  /**
   * Get a value from cache
   * @param key Cache key
   * @returns Cached value or undefined if not found
   */
  public get<T>(key: string): T | undefined {
    return this.cache.get<T>(key);
  }

  /**
   * Set a value in cache
   * @param key Cache key
   * @param value Value to cache
   * @param ttl TTL in seconds (optional, uses default if not provided)
   */
  public set<T>(key: string, value: T, ttl?: number): boolean {
    return this.cache.set(key, value, ttl);
  }

  /**
   * Delete a value from cache
   * @param key Cache key
   * @returns true if deleted, false if not found
   */
  public delete(key: string): boolean {
    return this.cache.del(key) > 0;
  }

  /**
   * Get a value from cache or compute it if not found
   * @param key Cache key
   * @param compute Function to compute value if not in cache
   * @param ttl TTL in seconds (optional)
   * @returns Cached or computed value
   */
  public async getOrCompute<T>(
    key: string,
    compute: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== undefined) {
      return cached;
    }

    const computed = await compute();
    this.set(key, computed, ttl);
    return computed;
  }

  /**
   * Clear all cached values
   */
  public clear(): void {
    this.cache.flushAll();
  }

  /**
   * Get cache statistics
   */
  public getStats() {
    return this.cache.getStats();
  }

  /**
   * Get all cache keys
   */
  public getKeys(): string[] {
    return this.cache.keys();
  }

  /**
   * Check if a key exists in cache
   */
  public has(key: string): boolean {
    return this.cache.has(key);
  }

  /**
   * Get TTL of a key
   */
  public getTtl(key: string): number | undefined {
    return this.cache.getTtl(key);
  }

  /**
   * Set new TTL for a key
   */
  public setTtl(key: string, ttl: number): boolean {
    return this.cache.ttl(key, ttl);
  }
}

// Export singleton instance
export const cacheService = CacheService.getInstance();
