module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:4173'],
      numberOfRuns: 3,
      settings: {
        preset: 'mobile',
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
        formFactor: 'mobile',
        throttling: {
          cpuSlowdownMultiplier: 4,
          rttMs: 150,
          throughputKbps: 1638.4 // Slow 4G
        },
        screenEmulation: {
          mobile: true,
          width: 360,
          height: 640,
          deviceScaleFactor: 2,
          disabled: false
        }
      }
    },
    assert: {
      assertions: {
        'first-contentful-paint': ['error', { maxNumericValue: 3000 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 4000 }],
        'interactive': ['error', { maxNumericValue: 5000 }],
        'total-blocking-time': ['error', { maxNumericValue: 600 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.25 }],
        'categories:performance': ['error', { minScore: 0.8 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }]
      }
    },
    upload: {
      target: 'temporary-public-storage'
    }
  }
};
