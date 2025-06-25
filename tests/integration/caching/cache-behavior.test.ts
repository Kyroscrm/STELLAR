import { withCache, generateCacheKey } from '../../../src/lib/edge-function-helpers';
import { cacheService, TTL } from '../../../src/lib/cache';

describe('Cache Integration Tests', () => {
  beforeEach(() => {
    cacheService.clear();
  });

  it('should cache API responses and respect TTL', async () => {
    let fetchCount = 0;
    const mockData = { id: 1, name: 'Test' };
    const fetchData = async () => {
      fetchCount++;
      return mockData;
    };

    // First call - should fetch
    const result1 = await withCache('test-key', fetchData, { ttl: 1 });
    expect(result1.data).toEqual(mockData);
    expect(result1.headers['X-Cache']).toBe('MISS');
    expect(fetchCount).toBe(1);

    // Second call - should use cache
    const result2 = await withCache('test-key', fetchData, { ttl: 1 });
    expect(result2.data).toEqual(mockData);
    expect(result2.headers['X-Cache']).toBe('HIT');
    expect(fetchCount).toBe(1);

    // Wait for TTL to expire
    await new Promise(resolve => setTimeout(resolve, 1100));

    // Third call - should fetch again
    const result3 = await withCache('test-key', fetchData, { ttl: 1 });
    expect(result3.data).toEqual(mockData);
    expect(result3.headers['X-Cache']).toBe('MISS');
    expect(fetchCount).toBe(2);
  });

  it('should handle concurrent requests', async () => {
    let fetchCount = 0;
    const mockData = { id: 1, name: 'Test' };
    const fetchData = async () => {
      await new Promise(resolve => setTimeout(resolve, 100)); // Simulate network delay
      fetchCount++;
      return mockData;
    };

    // Make multiple concurrent requests
    const results = await Promise.all([
      withCache('concurrent-key', fetchData),
      withCache('concurrent-key', fetchData),
      withCache('concurrent-key', fetchData)
    ]);

    // Only one fetch should have occurred
    expect(fetchCount).toBe(1);

    // All requests should have the same data
    results.forEach(result => {
      expect(result.data).toEqual(mockData);
    });

    // First request should be a MISS, others should be HITs
    expect(results.filter(r => r.headers['X-Cache'] === 'MISS')).toHaveLength(1);
    expect(results.filter(r => r.headers['X-Cache'] === 'HIT')).toHaveLength(2);
  });

  it('should handle errors gracefully', async () => {
    const error = new Error('Test error');
    const fetchData = async () => {
      throw error;
    };

    const result = await withCache('error-key', fetchData);
    expect(result.data).toBeNull();
    expect(result.error).toEqual(error);
    expect(result.headers['Cache-Control']).toBe('no-store');
    expect(result.headers['X-Cache']).toBe('ERROR');

    // Error should not be cached
    const mockData = { id: 1, name: 'Test' };
    const validFetch = async () => mockData;
    const result2 = await withCache('error-key', validFetch);
    expect(result2.data).toEqual(mockData);
    expect(result2.headers['X-Cache']).toBe('MISS');
  });

  it('should generate consistent cache keys for complex parameters', async () => {
    const params1 = {
      filters: { status: 'active', type: 'user' },
      sort: { field: 'name', order: 'asc' },
      pagination: { page: 1, limit: 10 }
    };

    const params2 = {
      sort: { order: 'asc', field: 'name' },
      pagination: { limit: 10, page: 1 },
      filters: { type: 'user', status: 'active' }
    };

    const key1 = generateCacheKey('test', params1);
    const key2 = generateCacheKey('test', params2);

    // Keys should be identical despite different object structures
    expect(key1).toBe(key2);

    // Test caching with these keys
    let fetchCount = 0;
    const mockData = { id: 1, name: 'Test' };
    const fetchData = async () => {
      fetchCount++;
      return mockData;
    };

    await withCache(key1, fetchData);
    await withCache(key2, fetchData);

    // Should only fetch once since keys are identical
    expect(fetchCount).toBe(1);
  });

  it('should respect stale-while-revalidate', async () => {
    let fetchCount = 0;
    const mockData = { id: 1, name: 'Test' };
    const fetchData = async () => {
      fetchCount++;
      return mockData;
    };

    // First call - should fetch
    const result1 = await withCache('stale-key', fetchData, {
      ttl: 1,
      staleWhileRevalidate: 2
    });
    expect(result1.headers['Cache-Control']).toBe('public, max-age=1, stale-while-revalidate=2');
    expect(fetchCount).toBe(1);

    // Wait for TTL to expire but within stale window
    await new Promise(resolve => setTimeout(resolve, 1100));

    // Second call - should use stale data
    const result2 = await withCache('stale-key', fetchData, {
      ttl: 1,
      staleWhileRevalidate: 2
    });
    expect(result2.data).toEqual(mockData);
    expect(result2.headers['X-Cache']).toBe('HIT');

    // Wait for stale window to expire
    await new Promise(resolve => setTimeout(resolve, 1100));

    // Third call - should fetch new data
    const result3 = await withCache('stale-key', fetchData, {
      ttl: 1,
      staleWhileRevalidate: 2
    });
    expect(result3.headers['X-Cache']).toBe('MISS');
    expect(fetchCount).toBe(2);
  });
});
