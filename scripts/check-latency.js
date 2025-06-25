const fetch = require('node-fetch');

async function checkLatency() {
  const endpoints = [
    `${process.env.API_ENDPOINT}/health`,
    `${process.env.API_ENDPOINT}/api/dashboard`,
    `${process.env.API_ENDPOINT}/api/leads`,
  ];

  try {
    for (const endpoint of endpoints) {
      const start = Date.now();
      const response = await fetch(endpoint);
      const duration = Date.now() - start;

      if (duration > 500) { // More than 500ms
        console.error(`High latency detected for ${endpoint}: ${duration}ms`);
        process.exit(1);
      }

      if (!response.ok) {
        console.error(`Endpoint ${endpoint} returned ${response.status}`);
        process.exit(1);
      }

      console.log(`Latency check passed for ${endpoint}: ${duration}ms`);
    }

    console.log('All latency checks passed');
    process.exit(0);
  } catch (error) {
    console.error('Error checking latency:', error);
    process.exit(1);
  }
}

checkLatency();
