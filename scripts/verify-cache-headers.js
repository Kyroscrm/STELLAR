const https = require('https');
const { URL } = require('url');

// Configuration
const config = {
  baseUrl: process.env.VERIFY_URL || 'https://your-production-url.com',
  paths: {
    static: [
      '/assets/main.js',
      '/assets/main.css',
      '/assets/logo.svg',
      '/fonts/inter.woff2'
    ],
    api: [
      '/api/dashboard/stats',
      '/api/customers/list',
      '/api/leads/summary'
    ],
    html: [
      '/',
      '/dashboard',
      '/customers'
    ]
  },
  expectedHeaders: {
    static: {
      'Cache-Control': 'public, max-age=31536000, immutable'
    },
    api: {
      'Cache-Control': 'public, max-age=60, stale-while-revalidate=300'
    },
    html: {
      'Cache-Control': 'public, max-age=0, must-revalidate'
    }
  }
};

// Helper function to make HTTP requests
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve({
        statusCode: res.statusCode,
        headers: res.headers
      }));
    }).on('error', reject);
  });
}

// Helper function to verify headers
function verifyHeaders(actual, expected, path) {
  const issues = [];

  for (const [header, expectedValue] of Object.entries(expected)) {
    const actualValue = actual[header.toLowerCase()];
    if (!actualValue) {
      issues.push(`Missing header: ${header}`);
    } else if (actualValue !== expectedValue) {
      issues.push(`Invalid ${header}: expected "${expectedValue}", got "${actualValue}"`);
    }
  }

  return {
    path,
    passed: issues.length === 0,
    issues
  };
}

// Main verification function
async function verifyAll() {
  const results = {
    static: [],
    api: [],
    html: [],
    summary: {
      total: 0,
      passed: 0,
      failed: 0
    }
  };

  // Test each category
  for (const [category, paths] of Object.entries(config.paths)) {
    console.log(`\nTesting ${category} paths...`);

    for (const path of paths) {
      const url = new URL(path, config.baseUrl);
      try {
        const response = await makeRequest(url);
        const result = verifyHeaders(
          response.headers,
          config.expectedHeaders[category],
          path
        );

        results[category].push(result);
        results.summary.total++;

        if (result.passed) {
          results.summary.passed++;
          console.log(`✅ ${path}`);
        } else {
          results.summary.failed++;
          console.log(`❌ ${path}`);
          result.issues.forEach(issue => console.log(`   ${issue}`));
        }
      } catch (error) {
        results[category].push({
          path,
          passed: false,
          issues: [`Request failed: ${error.message}`]
        });
        results.summary.total++;
        results.summary.failed++;
        console.log(`❌ ${path}`);
        console.log(`   Request failed: ${error.message}`);
      }
    }
  }

  // Print summary
  console.log('\nSummary:');
  console.log('========');
  console.log(`Total paths checked: ${results.summary.total}`);
  console.log(`Passed: ${results.summary.passed}`);
  console.log(`Failed: ${results.summary.failed}`);

  // Exit with appropriate code
  process.exit(results.summary.failed > 0 ? 1 : 0);
}

// Run verification if called directly
if (require.main === module) {
  if (!process.env.VERIFY_URL) {
    console.error('Error: VERIFY_URL environment variable is required');
    process.exit(1);
  }
  verifyAll().catch(error => {
    console.error('Verification failed:', error);
    process.exit(1);
  });
}

module.exports = {
  verifyHeaders,
  makeRequest,
  config
};
