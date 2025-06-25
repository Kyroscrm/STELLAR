const Sentry = require('@sentry/node');

// Initialize Sentry with monitoring DSN
Sentry.init({
  dsn: process.env.SENTRY_DSN_MONITORING,
});

async function checkErrorRate() {
  try {
    const now = new Date();
    const fiveMinutesAgo = new Date(now - 5 * 60 * 1000);

    // Query for recent errors
    const query = `
      is:unresolved
      timesSeen:>1
      firstSeen:>${fiveMinutesAgo.toISOString()}
    `;

    const issues = await Sentry.api.request(
      `/projects/${process.env.SENTRY_ORG}/${process.env.SENTRY_PROJECT}/issues/?query=${query}`
    );

    if (issues.length > 0) {
      const errorRate = issues.reduce((sum, issue) => sum + issue.count, 0) / (5 * 60); // errors per second
      if (errorRate > 0.01) { // More than 1% error rate
        console.error(`High error rate detected: ${errorRate.toFixed(2)} errors/sec`);
        process.exit(1);
      }
    }

    console.log('Error rate check passed');
    process.exit(0);
  } catch (error) {
    console.error('Error checking error rate:', error);
    process.exit(1);
  }
}

checkErrorRate();
