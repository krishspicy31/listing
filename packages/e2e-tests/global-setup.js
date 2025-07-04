/**
 * Global Setup for Story 1.3 Playwright Tests
 * 
 * This file runs once before all tests to ensure the backend is ready
 * and test data is properly configured.
 */

const { chromium } = require('@playwright/test');

async function globalSetup() {
  console.log('🚀 Starting global setup for Story 1.3 tests...');
  
  // Launch browser for setup tasks
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Wait for backend server to be ready
    console.log('⏳ Waiting for backend server...');
    
    let retries = 30;
    let serverReady = false;
    
    while (retries > 0 && !serverReady) {
      try {
        const response = await page.request.get('http://localhost:8000/api/events/');
        if (response.status() === 200) {
          serverReady = true;
          console.log('✅ Backend server is ready');
        }
      } catch (error) {
        console.log(`⏳ Server not ready, retrying... (${retries} attempts left)`);
        await page.waitForTimeout(2000);
        retries--;
      }
    }
    
    if (!serverReady) {
      throw new Error('❌ Backend server failed to start within timeout period');
    }
    
    // Verify API endpoint is working
    console.log('🔍 Verifying API endpoint functionality...');
    const response = await page.request.get('http://localhost:8000/api/events/');
    const data = await response.json();
    
    console.log(`📊 Found ${data.count} approved events in database`);
    
    if (data.count === 0) {
      console.log('⚠️  Warning: No approved events found. Some tests may not work as expected.');
    }
    
    // Verify required test data exists
    const testCities = ['Chennai', 'Mumbai', 'Delhi'];
    const testCategories = ['Dance', 'Music', 'Festival'];
    
    for (const city of testCities) {
      const cityResponse = await page.request.get(`http://localhost:8000/api/events/?city=${city}`);
      const cityData = await cityResponse.json();
      console.log(`📍 Found ${cityData.count} events in ${city}`);
    }
    
    for (const category of testCategories) {
      const categoryResponse = await page.request.get(`http://localhost:8000/api/events/?category=${category}`);
      const categoryData = await categoryResponse.json();
      console.log(`🎭 Found ${categoryData.count} events in ${category} category`);
    }
    
    console.log('✅ Global setup completed successfully');
    
  } catch (error) {
    console.error('❌ Global setup failed:', error.message);
    throw error;
  } finally {
    await browser.close();
  }
}

module.exports = globalSetup;
