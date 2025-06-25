const { verifyHeaders, config } = require('../../../scripts/verify-cache-headers');

describe('Cache Headers Verification', () => {
  describe('verifyHeaders', () => {
    it('should pass when all headers match', () => {
      const actual = {
        'cache-control': 'public, max-age=31536000, immutable'
      };
      const expected = {
        'Cache-Control': 'public, max-age=31536000, immutable'
      };
      const path = '/assets/main.js';

      const result = verifyHeaders(actual, expected, path);

      expect(result.passed).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    it('should fail when header is missing', () => {
      const actual = {};
      const expected = {
        'Cache-Control': 'public, max-age=31536000, immutable'
      };
      const path = '/assets/main.js';

      const result = verifyHeaders(actual, expected, path);

      expect(result.passed).toBe(false);
      expect(result.issues).toContain('Missing header: Cache-Control');
    });

    it('should fail when header value is incorrect', () => {
      const actual = {
        'cache-control': 'no-cache'
      };
      const expected = {
        'Cache-Control': 'public, max-age=31536000, immutable'
      };
      const path = '/assets/main.js';

      const result = verifyHeaders(actual, expected, path);

      expect(result.passed).toBe(false);
      expect(result.issues).toContain(
        'Invalid Cache-Control: expected "public, max-age=31536000, immutable", got "no-cache"'
      );
    });

    it('should handle multiple headers', () => {
      const actual = {
        'cache-control': 'public, max-age=31536000, immutable',
        'content-type': 'text/javascript',
        'x-custom': 'test'
      };
      const expected = {
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Content-Type': 'text/javascript'
      };
      const path = '/assets/main.js';

      const result = verifyHeaders(actual, expected, path);

      expect(result.passed).toBe(true);
      expect(result.issues).toHaveLength(0);
    });
  });

  describe('Configuration', () => {
    it('should have valid static file headers', () => {
      expect(config.expectedHeaders.static['Cache-Control']).toBe(
        'public, max-age=31536000, immutable'
      );
    });

    it('should have valid API headers', () => {
      expect(config.expectedHeaders.api['Cache-Control']).toBe(
        'public, max-age=60, stale-while-revalidate=300'
      );
    });

    it('should have valid HTML headers', () => {
      expect(config.expectedHeaders.html['Cache-Control']).toBe(
        'public, max-age=0, must-revalidate'
      );
    });

    it('should have test paths for each category', () => {
      expect(config.paths.static.length).toBeGreaterThan(0);
      expect(config.paths.api.length).toBeGreaterThan(0);
      expect(config.paths.html.length).toBeGreaterThan(0);
    });

    it('should have valid paths', () => {
      const allPaths = [
        ...config.paths.static,
        ...config.paths.api,
        ...config.paths.html
      ];

      allPaths.forEach(path => {
        expect(path.startsWith('/')).toBe(true);
        expect(path).not.toContain('?');
        expect(path).not.toContain('#');
      });
    });
  });
});
