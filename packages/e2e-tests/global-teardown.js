/**
 * Global Teardown for Story 1.3 Playwright Tests
 * 
 * This file runs once after all tests to clean up resources
 * and generate final test reports.
 */

async function globalTeardown() {
  console.log('🧹 Starting global teardown for Story 1.3 tests...');
  
  try {
    // Log test completion
    console.log('📋 Test execution completed');
    
    // Clean up any temporary files or resources if needed
    console.log('🗑️  Cleaning up temporary resources...');
    
    // Generate summary report
    console.log('📊 Generating test summary...');
    
    const fs = require('fs');
    const path = require('path');
    
    // Create test results directory if it doesn't exist
    const resultsDir = path.join(__dirname, 'test-results');
    if (!fs.existsSync(resultsDir)) {
      fs.mkdirSync(resultsDir, { recursive: true });
    }
    
    // Create a simple summary file
    const summary = {
      testSuite: 'Story 1.3: Create Public API for Approved Events',
      timestamp: new Date().toISOString(),
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        baseURL: 'http://localhost:8000'
      },
      testCategories: [
        'Authentication & Authorization',
        'Event Data Validation', 
        'Filtering Functionality',
        'Pagination',
        'Security',
        'Performance',
        'Error Handling',
        'Integration Tests'
      ]
    };
    
    fs.writeFileSync(
      path.join(resultsDir, 'test-summary.json'),
      JSON.stringify(summary, null, 2)
    );
    
    console.log('✅ Global teardown completed successfully');
    
  } catch (error) {
    console.error('❌ Global teardown failed:', error.message);
    // Don't throw error in teardown to avoid masking test failures
  }
}

module.exports = globalTeardown;
