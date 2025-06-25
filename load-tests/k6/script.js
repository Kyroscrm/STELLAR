import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';
import { randomString } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

// Custom metrics
const customMetrics = {
  leads_created: new Counter('leads_created'),
  estimates_created: new Counter('estimates_created'),
  invoices_created: new Counter('invoices_created'),
  dashboard_load_time: new Trend('dashboard_load_time'),
  api_errors: new Rate('api_errors')
};

// Test configuration
export const options = {
  scenarios: {
    smoke_test: {
      executor: 'ramping-vus',
      startVUs: 1,
      stages: [
        { duration: '1m', target: 50 }
      ],
      gracefulRampDown: '30s',
      exec: 'smokeTest'
    },
    peak_load: {
      executor: 'ramping-vus',
      startVUs: 50,
      stages: [
        { duration: '30s', target: 100 },
        { duration: '2m', target: 200 },
        { duration: '30s', target: 100 }
      ],
      gracefulRampDown: '30s',
      exec: 'peakLoad'
    },
    stress_test: {
      executor: 'ramping-vus',
      startVUs: 100,
      stages: [
        { duration: '1m', target: 300 },
        { duration: '2m', target: 500 },
        { duration: '1m', target: 0 }
      ],
      gracefulRampDown: '30s',
      exec: 'stressTest'
    }
  },
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests under 500ms
    http_req_failed: ['rate<0.01'],   // Less than 1% errors
    'dashboard_load_time': ['p(95)<1000'], // Dashboard loads under 1s
    'api_errors': ['rate<0.01']  // API error rate under 1%
  }
};

// Helper functions
function getAuthToken() {
  const loginRes = http.post(`${__ENV.API_URL}/auth/login`, JSON.stringify({
    email: __ENV.TEST_USER_EMAIL,
    password: __ENV.TEST_USER_PASSWORD
  }), {
    headers: { 'Content-Type': 'application/json' }
  });

  check(loginRes, {
    'login successful': (r) => r.status === 200,
    'token received': (r) => r.json('accessToken') !== undefined
  });

  return loginRes.json('accessToken');
}

function generateTestData() {
  const timestamp = new Date().toISOString();
  const random = randomString(8);

  return {
    lead: {
      name: `Test Lead ${random}`,
      email: `test.${random}@example.com`,
      phone: '+1234567890',
      source: 'k6_test',
      status: 'new',
      notes: `Created by k6 test at ${timestamp}`
    },
    estimate: {
      title: `Test Estimate ${random}`,
      customerName: `Test Customer ${random}`,
      items: [
        { description: 'Item 1', quantity: 1, unitPrice: 100 },
        { description: 'Item 2', quantity: 2, unitPrice: 50 }
      ],
      status: 'draft'
    },
    invoice: {
      title: `Test Invoice ${random}`,
      customerName: `Test Customer ${random}`,
      amount: 250,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'draft'
    }
  };
}

// Test scenarios
export function smokeTest() {
  const token = getAuthToken();
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  group('Smoke Test - Basic Operations', () => {
    // Fetch dashboard
    const dashboardStart = new Date();
    const dashboardRes = http.get(`${__ENV.API_URL}/api/dashboard/stats`, { headers });
    customMetrics.dashboard_load_time.add(new Date() - dashboardStart);

    check(dashboardRes, {
      'dashboard loaded': (r) => r.status === 200
    }) || customMetrics.api_errors.add(1);

    // Fetch leads
    const leadsRes = http.get(`${__ENV.API_URL}/api/leads`, { headers });
    check(leadsRes, {
      'leads loaded': (r) => r.status === 200
    }) || customMetrics.api_errors.add(1);

    sleep(1);
  });
}

export function peakLoad() {
  const token = getAuthToken();
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
  const testData = generateTestData();

  group('Peak Load - Create Resources', () => {
    // Create lead
    const leadRes = http.post(
      `${__ENV.API_URL}/api/leads`,
      JSON.stringify(testData.lead),
      { headers }
    );
    check(leadRes, {
      'lead created': (r) => r.status === 201
    }) || customMetrics.api_errors.add(1);
    customMetrics.leads_created.add(1);

    // Create estimate
    const estimateRes = http.post(
      `${__ENV.API_URL}/api/estimates`,
      JSON.stringify(testData.estimate),
      { headers }
    );
    check(estimateRes, {
      'estimate created': (r) => r.status === 201
    }) || customMetrics.api_errors.add(1);
    customMetrics.estimates_created.add(1);

    // Create invoice
    const invoiceRes = http.post(
      `${__ENV.API_URL}/api/invoices`,
      JSON.stringify(testData.invoice),
      { headers }
    );
    check(invoiceRes, {
      'invoice created': (r) => r.status === 201
    }) || customMetrics.api_errors.add(1);
    customMetrics.invoices_created.add(1);

    sleep(2);
  });
}

export function stressTest() {
  const token = getAuthToken();
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
  const testData = generateTestData();

  group('Stress Test - Mixed Operations', () => {
    // Random operation selection
    const operation = Math.random();

    if (operation < 0.4) { // 40% reads
      const endpoints = [
        '/api/dashboard/stats',
        '/api/leads',
        '/api/estimates',
        '/api/invoices',
        '/api/customers'
      ];
      const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];

      const start = new Date();
      const res = http.get(`${__ENV.API_URL}${endpoint}`, { headers });
      if (endpoint === '/api/dashboard/stats') {
        customMetrics.dashboard_load_time.add(new Date() - start);
      }

      check(res, {
        'read successful': (r) => r.status === 200
      }) || customMetrics.api_errors.add(1);
    } else if (operation < 0.7) { // 30% writes
      const leadRes = http.post(
        `${__ENV.API_URL}/api/leads`,
        JSON.stringify(testData.lead),
        { headers }
      );
      check(leadRes, {
        'write successful': (r) => r.status === 201
      }) || customMetrics.api_errors.add(1);
      customMetrics.leads_created.add(1);
    } else { // 30% mixed (create estimate + invoice)
      const estimateRes = http.post(
        `${__ENV.API_URL}/api/estimates`,
        JSON.stringify(testData.estimate),
        { headers }
      );
      check(estimateRes, {
        'estimate created': (r) => r.status === 201
      }) || customMetrics.api_errors.add(1);
      customMetrics.estimates_created.add(1);

      const invoiceRes = http.post(
        `${__ENV.API_URL}/api/invoices`,
        JSON.stringify(testData.invoice),
        { headers }
      );
      check(invoiceRes, {
        'invoice created': (r) => r.status === 201
      }) || customMetrics.api_errors.add(1);
      customMetrics.invoices_created.add(1);
    }

    sleep(1);
  });
}
