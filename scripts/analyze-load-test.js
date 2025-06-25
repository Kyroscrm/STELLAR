const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  thresholds: {
    http_req_duration: {
      p95: 500, // 95th percentile should be under 500ms
      p99: 1000 // 99th percentile should be under 1000ms
    },
    error_rate: 0.01, // 1% error rate threshold
    throughput: {
      min: 10 // Minimum requests per second
    }
  },
  trends: {
    duration: {
      warning: 0.1, // 10% increase
      critical: 0.25 // 25% increase
    },
    errors: {
      warning: 0.005, // 0.5% increase
      critical: 0.01 // 1% increase
    }
  }
};

// Helper functions
function calculateStats(metrics) {
  return {
    totalRequests: metrics.http_reqs.values.count,
    duration: {
      p95: metrics.http_req_duration.values.p95,
      p99: metrics.http_req_duration.values.p99,
      avg: metrics.http_req_duration.values.avg,
      med: metrics.http_req_duration.values.med
    },
    errors: {
      rate: metrics.http_req_failed.values.rate,
      count: metrics.http_req_failed.values.count
    },
    throughput: metrics.http_reqs.values.count / (metrics.data_received.values.count / 1000),
    customMetrics: {
      leads: metrics.leads_created?.values.count || 0,
      estimates: metrics.estimates_created?.values.count || 0,
      invoices: metrics.invoices_created?.values.count || 0,
      dashboardLoadTime: metrics.dashboard_load_time?.values.avg || 0,
      apiErrors: metrics.api_errors?.values.rate || 0
    }
  };
}

function compareWithBaseline(current, baseline) {
  const changes = {
    duration: {
      p95: (current.duration.p95 - baseline.duration.p95) / baseline.duration.p95,
      p99: (current.duration.p99 - baseline.duration.p99) / baseline.duration.p99,
      avg: (current.duration.avg - baseline.duration.avg) / baseline.duration.avg
    },
    errors: {
      rate: current.errors.rate - baseline.errors.rate
    },
    throughput: (current.throughput - baseline.throughput) / baseline.throughput
  };

  const insights = [];

  // Analyze response time changes
  if (Math.abs(changes.duration.p95) > config.trends.duration.critical) {
    insights.push({
      level: 'critical',
      metric: 'p95 response time',
      change: `${(changes.duration.p95 * 100).toFixed(1)}%`,
      message: `P95 response time has ${changes.duration.p95 > 0 ? 'increased' : 'decreased'} significantly`
    });
  } else if (Math.abs(changes.duration.p95) > config.trends.duration.warning) {
    insights.push({
      level: 'warning',
      metric: 'p95 response time',
      change: `${(changes.duration.p95 * 100).toFixed(1)}%`,
      message: `P95 response time shows notable ${changes.duration.p95 > 0 ? 'increase' : 'decrease'}`
    });
  }

  // Analyze error rate changes
  if (Math.abs(changes.errors.rate) > config.trends.errors.critical) {
    insights.push({
      level: 'critical',
      metric: 'error rate',
      change: `${(changes.errors.rate * 100).toFixed(2)}%`,
      message: `Error rate has changed significantly`
    });
  } else if (Math.abs(changes.errors.rate) > config.trends.errors.warning) {
    insights.push({
      level: 'warning',
      metric: 'error rate',
      change: `${(changes.errors.rate * 100).toFixed(2)}%`,
      message: `Error rate shows notable change`
    });
  }

  // Analyze throughput changes
  if (Math.abs(changes.throughput) > 0.2) { // 20% change threshold
    insights.push({
      level: 'warning',
      metric: 'throughput',
      change: `${(changes.throughput * 100).toFixed(1)}%`,
      message: `Throughput has ${changes.throughput > 0 ? 'increased' : 'decreased'} significantly`
    });
  }

  return { changes, insights };
}

function generateReport(testResults, baselineResults = null) {
  const stats = calculateStats(testResults.metrics);
  const report = {
    summary: {
      testType: testResults.testInfo.type,
      environment: testResults.testInfo.env,
      timestamp: new Date(testResults.testInfo.timestamp).toISOString(),
      duration: testResults.testInfo.duration,
      totalRequests: stats.totalRequests,
      successRate: ((1 - stats.errors.rate) * 100).toFixed(2) + '%',
      avgResponseTime: stats.duration.avg.toFixed(2) + 'ms',
      p95ResponseTime: stats.duration.p95.toFixed(2) + 'ms',
      throughput: stats.throughput.toFixed(2) + ' req/s'
    },
    thresholds: {
      passed: Object.entries(testResults.thresholds).every(([_, v]) => v.ok),
      details: Object.entries(testResults.thresholds).map(([k, v]) => ({
        name: k,
        passed: v.ok,
        message: v.message
      }))
    },
    customMetrics: {
      leads: stats.customMetrics.leads,
      estimates: stats.customMetrics.estimates,
      invoices: stats.customMetrics.invoices,
      avgDashboardLoadTime: stats.customMetrics.dashboardLoadTime.toFixed(2) + 'ms',
      apiErrorRate: (stats.customMetrics.apiErrors * 100).toFixed(2) + '%'
    }
  };

  if (baselineResults) {
    const baselineStats = calculateStats(baselineResults.metrics);
    const comparison = compareWithBaseline(stats, baselineStats);
    report.comparison = comparison;
  }

  return report;
}

// Main execution
function main() {
  const resultsPath = path.join(__dirname, '../load-tests/results.json');
  const baselinePath = path.join(__dirname, '../load-tests/baseline.json');

  if (!fs.existsSync(resultsPath)) {
    console.error('No test results found');
    process.exit(1);
  }

  const testResults = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
  let baselineResults = null;

  if (fs.existsSync(baselinePath)) {
    baselineResults = JSON.parse(fs.readFileSync(baselinePath, 'utf8'));
  }

  const report = generateReport(testResults, baselineResults);

  // Save the report
  const reportPath = path.join(__dirname, '../load-tests/analysis.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  // Print summary to console
  console.log('\nLoad Test Analysis Summary');
  console.log('=========================');
  console.log(`Test Type: ${report.summary.testType}`);
  console.log(`Environment: ${report.summary.environment}`);
  console.log(`Timestamp: ${report.summary.timestamp}`);
  console.log(`Duration: ${report.summary.duration}`);
  console.log('\nMetrics:');
  console.log(`- Total Requests: ${report.summary.totalRequests}`);
  console.log(`- Success Rate: ${report.summary.successRate}`);
  console.log(`- Avg Response Time: ${report.summary.avgResponseTime}`);
  console.log(`- P95 Response Time: ${report.summary.p95ResponseTime}`);
  console.log(`- Throughput: ${report.summary.throughput}`);

  console.log('\nThresholds:');
  report.thresholds.details.forEach(t => {
    console.log(`- ${t.name}: ${t.passed ? '✅' : '❌'} ${t.message || ''}`);
  });

  if (report.comparison) {
    console.log('\nComparison with Baseline:');
    report.comparison.insights.forEach(insight => {
      const icon = insight.level === 'critical' ? '🚨' : '⚠️';
      console.log(`${icon} ${insight.message} (${insight.change})`);
    });
  }

  // Exit with appropriate code
  process.exit(report.thresholds.passed ? 0 : 1);
}

if (require.main === module) {
  main();
}

module.exports = {
  generateReport,
  calculateStats,
  compareWithBaseline
};
