import { cacheService, TTL, CACHE_KEYS } from '../../../src/lib/cache';

describe('CacheService', () => {
  beforeEach(() => {
    cacheService.clear();
  });

  it('should set and get values', () => {
    const key = 'test-key';
    const value = { foo: 'bar' };

    cacheService.set(key, value);
    expect(cacheService.get(key)).toEqual(value);
  });

  it('should respect TTL', async () => {
    const key = 'ttl-test';
    const value = { foo: 'bar' };

    cacheService.set(key, value, 1); // 1 second TTL
    expect(cacheService.get(key)).toEqual(value);

    await new Promise(resolve => setTimeout(resolve, 1100)); // Wait for TTL to expire
    expect(cacheService.get(key)).toBeUndefined();
  });

  it('should delete values', () => {
    const key = 'delete-test';
    const value = { foo: 'bar' };

    cacheService.set(key, value);
    expect(cacheService.get(key)).toEqual(value);

    cacheService.delete(key);
    expect(cacheService.get(key)).toBeUndefined();
  });

  it('should get or compute values', async () => {
    const key = 'compute-test';
    const value = { foo: 'bar' };
    let computeCalls = 0;

    const compute = async () => {
      computeCalls++;
      return value;
    };

    // First call should compute
    const result1 = await cacheService.getOrCompute(key, compute);
    expect(result1).toEqual(value);
    expect(computeCalls).toBe(1);

    // Second call should use cache
    const result2 = await cacheService.getOrCompute(key, compute);
    expect(result2).toEqual(value);
    expect(computeCalls).toBe(1); // Still 1, not recomputed
  });

  it('should clear all values', () => {
    const keys = ['key1', 'key2', 'key3'];
    const value = { foo: 'bar' };

    keys.forEach(key => cacheService.set(key, value));
    keys.forEach(key => expect(cacheService.get(key)).toEqual(value));

    cacheService.clear();
    keys.forEach(key => expect(cacheService.get(key)).toBeUndefined());
  });

  it('should get cache statistics', () => {
    const key = 'stats-test';
    const value = { foo: 'bar' };

    cacheService.set(key, value);
    cacheService.get(key);
    cacheService.get('non-existent');

    const stats = cacheService.getStats();
    expect(stats.hits).toBe(1);
    expect(stats.misses).toBe(1);
    expect(stats.keys).toBe(1);
  });

  it('should get all cache keys', () => {
    const keys = ['key1', 'key2', 'key3'];
    const value = { foo: 'bar' };

    keys.forEach(key => cacheService.set(key, value));
    const cachedKeys = cacheService.getKeys();

    expect(cachedKeys).toHaveLength(keys.length);
    keys.forEach(key => expect(cachedKeys).toContain(key));
  });

  it('should check if key exists', () => {
    const key = 'exists-test';
    const value = { foo: 'bar' };

    expect(cacheService.has(key)).toBe(false);
    cacheService.set(key, value);
    expect(cacheService.has(key)).toBe(true);
  });

  it('should get and set TTL', () => {
    const key = 'ttl-test';
    const value = { foo: 'bar' };
    const ttl = 60;

    cacheService.set(key, value, ttl);
    const remainingTtl = cacheService.getTtl(key);
    expect(remainingTtl).toBeGreaterThan(0);
    expect(remainingTtl).toBeLessThanOrEqual(ttl);

    const newTtl = 120;
    cacheService.setTtl(key, newTtl);
    expect(cacheService.getTtl(key)).toBeGreaterThan(ttl);
  });

  it('should use predefined TTL values', () => {
    expect(TTL.SHORT).toBe(60);
    expect(TTL.MEDIUM).toBe(300);
    expect(TTL.LONG).toBe(3600);
    expect(TTL.VERY_LONG).toBe(86400);
  });

  it('should use predefined cache keys', () => {
    expect(CACHE_KEYS.DASHBOARD_STATS).toBe('dashboardStats');
    expect(CACHE_KEYS.LEAD_METRICS).toBe('leadMetrics');
    expect(CACHE_KEYS.ESTIMATE_METRICS).toBe('estimateMetrics');
    expect(CACHE_KEYS.MONTHLY_REVENUE).toBe('monthlyRevenue');
    expect(CACHE_KEYS.ACTIVITY_LOGS).toBe('activityLogs');
    expect(CACHE_KEYS.CUSTOMER_LIST).toBe('customerList');
    expect(CACHE_KEYS.USER_PERMISSIONS).toBe('userPermissions');
  });
});
