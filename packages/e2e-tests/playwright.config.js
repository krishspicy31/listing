/**
 * Playwright Configuration for Story 1.3 API Tests
 * 
 * This configuration is optimized for testing the Events API endpoint
 * with proper timeouts, retries, and reporting for CI/CD environments.
 */

const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  // Test directory
  testDir: './tests',
  
  // Global test timeout
  timeout: 30000,
  
  // Expect timeout for assertions
  expect: {
    timeout: 10000
  },
  
  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,
  
  // Retry on CI only
  retries: process.env.CI ? 2 : 0,
  
  // Opt out of parallel tests on CI
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter configuration
  reporter: [
    ['html', { outputFolder: 'test-results/html-report' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['list']
  ],
  
  // Global setup and teardown
  globalSetup: require.resolve('./global-setup.js'),
  globalTeardown: require.resolve('./global-teardown.js'),
  
  // Shared settings for all projects
  use: {
    // Base URL for API tests
    baseURL: 'http://localhost:8000',
    
    // Collect trace when retrying the failed test
    trace: 'on-first-retry',
    
    // Record video on failure
    video: 'retain-on-failure',
    
    // Take screenshot on failure
    screenshot: 'only-on-failure',
    
    // API request timeout
    apiTimeout: 10000,
    
    // Extra HTTP headers
    extraHTTPHeaders: {
      'Accept': 'application/json',
      'User-Agent': 'Playwright-Story-1.3-Tests'
    }
  },

  // Configure projects for major browsers and API testing
  projects: [
    {
      name: 'API Tests',
      testMatch: '**/story-1.3-events-api.spec.js',
      use: {
        // API tests don't need a browser
        ...devices['Desktop Chrome']
      }
    },
    
    {
      name: 'Chrome Browser Tests',
      testMatch: '**/story-1.3-browser.spec.js',
      use: {
        ...devices['Desktop Chrome']
      }
    },
    
    {
      name: 'Firefox Browser Tests', 
      testMatch: '**/story-1.3-browser.spec.js',
      use: {
        ...devices['Desktop Firefox']
      }
    },
    
    {
      name: 'Safari Browser Tests',
      testMatch: '**/story-1.3-browser.spec.js', 
      use: {
        ...devices['Desktop Safari']
      }
    }
  ],

  // Run your local dev server before starting the tests
  webServer: [
    {
      command: 'cd ../culturalite-backend && python manage.py runserver 8000',
      port: 8000,
      timeout: 120000,
      reuseExistingServer: !process.env.CI
    }
  ],
  
  // Output directory for test artifacts
  outputDir: 'test-results/artifacts'
});
