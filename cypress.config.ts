import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:8080',
    setupNodeEvents(on, config) {
      on('task', {
        log(message) {
          console.log(message);
          return null;
        }
      });
      return config;
    },
    specPattern: 'cypress/integration/**/*.spec.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/index.ts',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true,
    testIsolation: true,
    retries: {
      runMode: 2,
      openMode: 0
    },
    defaultCommandTimeout: 10000,
    requestTimeout: 10000
  },
  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite'
    },
    supportFile: 'cypress/support/component.ts',
    indexHtmlFile: 'cypress/support/component-index.html',
    specPattern: 'src/**/*.cy.{js,jsx,ts,tsx}'
  },
  env: {
    codeCoverage: {
      exclude: ['cypress/**/*.*']
    }
  }
});
