import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

// Initialize Sentry for error monitoring
if (import.meta.env.VITE_SENTRY_DSN_FRONTEND) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN_FRONTEND,
    integrations: [new BrowserTracing()],
    tracesSampleRate: 0.2,
    // Performance monitoring thresholds
    tracesSampler: (samplingContext) => {
      // Adjust sampling rates based on operation
      if (samplingContext.transactionContext.name.includes('/api/')) {
        // Sample 50% of API calls
        return 0.5;
      }
      if (samplingContext.transactionContext.name.includes('dashboard')) {
        // Sample 30% of dashboard operations
        return 0.3;
      }
      // Default to 20% sampling rate
      return 0.2;
    },
    // Set performance monitoring thresholds
    performanceMonitoring: {
      enabled: true,
      tracingOrigins: ['localhost', window.location.hostname],
      idleTimeout: 5000,
      markBackgroundTransactions: true,
      routingInstrumentation: true,
    }
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
