import {
  withCache,
  generateCacheKey,
  invalidateCacheByPrefix,
  getCorsHeaders,
  combineHeaders,
  validateParams
} from '../../../src/lib/edge-function-helpers';
import { cacheService, TTL } from '../../../src/lib/cache';

describe('Edge Function Helpers', () => {
  beforeEach(() => {
    cacheService.clear();
  });

  describe('withCache', () => {
    it('should return cached data with HIT header', async () => {
      const key = 'test-key';
      const data = { foo: 'bar' };
      cacheService.set(key, data);

      const result = await withCache(key, async () => ({ foo: 'baz' }));

      expect(result.data).toEqual(data);
      expect(result.error).toBeNull();
      expect(result.headers['X-Cache']).toBe('HIT');
    });

    it('should fetch and cache data with MISS header', async () => {
      const key = 'test-key';
      const data = { foo: 'bar' };

      const result = await withCache(key, async () => data);

      expect(result.data).toEqual(data);
      expect(result.error).toBeNull();
      expect(result.headers['X-Cache']).toBe('MISS');
      expect(cacheService.get(key)).toEqual(data);
    });

    it('should handle errors with ERROR header', async () => {
      const key = 'test-key';
      const error = new Error('Test error');

      const result = await withCache(key, async () => {
        throw error;
      });

      expect(result.data).toBeNull();
      expect(result.error).toEqual(error);
      expect(result.headers['X-Cache']).toBe('ERROR');
      expect(result.headers['Cache-Control']).toBe('no-store');
    });

    it('should use custom cache config', async () => {
      const key = 'test-key';
      const data = { foo: 'bar' };
      const config = {
        ttl: 60,
        staleWhileRevalidate: 300,
        cacheControl: 'private, max-age=60'
      };

      const result = await withCache(key, async () => data, config);

      expect(result.headers['Cache-Control']).toBe(config.cacheControl);
    });
  });

  describe('generateCacheKey', () => {
    it('should generate consistent keys for same params in different order', () => {
      const params1 = { a: 1, b: 2 };
      const params2 = { b: 2, a: 1 };

      const key1 = generateCacheKey('test', params1);
      const key2 = generateCacheKey('test', params2);

      expect(key1).toBe(key2);
    });

    it('should handle empty params', () => {
      const key = generateCacheKey('test');
      expect(key).toBe('test:{}');
    });

    it('should handle null and undefined values', () => {
      const params = { a: null, b: undefined, c: 'test' };
      const key = generateCacheKey('test', params);
      expect(key).toBe('test:{"a":null,"b":null,"c":"test"}');
    });
  });

  describe('invalidateCacheByPrefix', () => {
    it('should invalidate all keys with matching prefix', () => {
      const data = { foo: 'bar' };
      cacheService.set('prefix:key1', data);
      cacheService.set('prefix:key2', data);
      cacheService.set('other:key3', data);

      invalidateCacheByPrefix('prefix:');

      expect(cacheService.get('prefix:key1')).toBeUndefined();
      expect(cacheService.get('prefix:key2')).toBeUndefined();
      expect(cacheService.get('other:key3')).toEqual(data);
    });
  });

  describe('getCorsHeaders', () => {
    it('should return default CORS headers', () => {
      const headers = getCorsHeaders();
      expect(headers['Access-Control-Allow-Origin']).toBe('*');
      expect(headers['Access-Control-Allow-Methods']).toBeDefined();
      expect(headers['Access-Control-Allow-Headers']).toBeDefined();
      expect(headers['Access-Control-Max-Age']).toBeDefined();
    });

    it('should use custom origin', () => {
      const origin = 'https://example.com';
      const headers = getCorsHeaders(origin);
      expect(headers['Access-Control-Allow-Origin']).toBe(origin);
    });
  });

  describe('combineHeaders', () => {
    it('should combine multiple header objects', () => {
      const headers1 = { 'X-Test-1': 'value1' };
      const headers2 = { 'X-Test-2': 'value2' };
      const headers3 = { 'X-Test-3': 'value3' };

      const combined = combineHeaders(headers1, headers2, headers3);

      expect(combined).toEqual({
        'X-Test-1': 'value1',
        'X-Test-2': 'value2',
        'X-Test-3': 'value3'
      });
    });

    it('should handle empty input', () => {
      const combined = combineHeaders();
      expect(combined).toEqual({});
    });

    it('should override duplicate headers with last value', () => {
      const headers1 = { 'X-Test': 'value1' };
      const headers2 = { 'X-Test': 'value2' };

      const combined = combineHeaders(headers1, headers2);

      expect(combined['X-Test']).toBe('value2');
    });
  });

  describe('validateParams', () => {
    it('should validate required fields', () => {
      const params = { field1: 'value1', field2: 'value2' };
      const required = ['field1', 'field2'];

      const result = validateParams(params, required);

      expect(result.isValid).toBe(true);
      expect(result.missingFields).toHaveLength(0);
    });

    it('should detect missing fields', () => {
      const params = { field1: 'value1' };
      const required = ['field1', 'field2'];

      const result = validateParams(params, required);

      expect(result.isValid).toBe(false);
      expect(result.missingFields).toEqual(['field2']);
    });

    it('should handle empty values', () => {
      const params = { field1: '', field2: null, field3: undefined };
      const required = ['field1', 'field2', 'field3'];

      const result = validateParams(params, required);

      expect(result.isValid).toBe(false);
      expect(result.missingFields).toEqual(['field1', 'field2', 'field3']);
    });
  });
});
