/**
 * Browser Integration Tests for Story 1.3: Create Public API for Approved Events
 * 
 * These tests verify the API works correctly when accessed from a browser
 * and test frontend integration scenarios.
 */

const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://localhost:8000';
const API_ENDPOINT = `${BASE_URL}/api/events/`;

test.describe('Story 1.3: Browser Integration Tests', () => {

  test.describe('🌐 Direct API Access in Browser', () => {
    
    test('should display JSON response when accessing API directly', async ({ page }) => {
      await page.goto(API_ENDPOINT);
      
      // Should display JSON content
      const content = await page.textContent('body');
      expect(content).toContain('"count"');
      expect(content).toContain('"results"');
      expect(content).toContain('"next"');
      expect(content).toContain('"previous"');
      
      // Take screenshot for documentation
      await page.screenshot({ 
        path: 'test-results/api-direct-access.png',
        fullPage: true 
      });
    });

    test('should handle API filtering in browser URL', async ({ page }) => {
      await page.goto(`${API_ENDPOINT}?city=Chennai`);
      
      const content = await page.textContent('body');
      expect(content).toContain('"count"');
      expect(content).toContain('Chennai');
      
      // Verify it's valid JSON
      const jsonContent = JSON.parse(content);
      expect(jsonContent).toHaveProperty('count');
      expect(jsonContent).toHaveProperty('results');
    });
  });

  test.describe('🔗 Frontend JavaScript Integration', () => {
    
    test('should work with fetch API from frontend', async ({ page }) => {
      // Create a simple HTML page to test fetch
      await page.setContent(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Events API Test</title>
        </head>
        <body>
          <div id="events-container">Loading...</div>
          <div id="error-container" style="color: red;"></div>
          
          <script>
            async function loadEvents() {
              try {
                const response = await fetch('${API_ENDPOINT}');
                const data = await response.json();
                
                document.getElementById('events-container').innerHTML = 
                  \`<h2>Found \${data.count} events</h2>
                   <div>First event: \${data.results[0]?.title || 'No events'}</div>\`;
                   
                // Store data for testing
                window.eventsData = data;
              } catch (error) {
                document.getElementById('error-container').innerHTML = 
                  'Error loading events: ' + error.message;
              }
            }
            
            loadEvents();
          </script>
        </body>
        </html>
      `);
      
      // Wait for the fetch to complete
      await page.waitForFunction(() => window.eventsData !== undefined, { timeout: 10000 });
      
      // Verify the data was loaded
      const eventsData = await page.evaluate(() => window.eventsData);
      expect(eventsData).toHaveProperty('count');
      expect(eventsData).toHaveProperty('results');
      
      // Verify UI was updated
      const container = await page.textContent('#events-container');
      expect(container).toContain('Found');
      expect(container).toContain('events');
      
      // Check for errors
      const errorContainer = await page.textContent('#error-container');
      expect(errorContainer).toBe('');
    });

    test('should handle CORS correctly', async ({ page }) => {
      // Monitor console for CORS errors
      const consoleMessages = [];
      page.on('console', msg => consoleMessages.push(msg.text()));
      
      await page.setContent(`
        <!DOCTYPE html>
        <html>
        <body>
          <script>
            fetch('${API_ENDPOINT}')
              .then(response => response.json())
              .then(data => {
                console.log('CORS test successful, got', data.count, 'events');
                window.corsTestResult = 'success';
              })
              .catch(error => {
                console.error('CORS test failed:', error.message);
                window.corsTestResult = 'failed';
              });
          </script>
        </body>
        </html>
      `);
      
      // Wait for the request to complete
      await page.waitForFunction(() => window.corsTestResult !== undefined, { timeout: 10000 });
      
      const result = await page.evaluate(() => window.corsTestResult);
      expect(result).toBe('success');
      
      // Check console messages for CORS errors
      const corsErrors = consoleMessages.filter(msg => 
        msg.toLowerCase().includes('cors') || 
        msg.toLowerCase().includes('cross-origin')
      );
      expect(corsErrors.length).toBe(0);
    });
  });

  test.describe('📱 Responsive API Testing', () => {
    
    test('should work on mobile viewport', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      await page.goto(API_ENDPOINT);
      
      const content = await page.textContent('body');
      expect(content).toContain('"count"');
      expect(content).toContain('"results"');
      
      // Take mobile screenshot
      await page.screenshot({ 
        path: 'test-results/api-mobile-view.png',
        fullPage: true 
      });
    });

    test('should work on tablet viewport', async ({ page }) => {
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });
      
      await page.goto(API_ENDPOINT);
      
      const content = await page.textContent('body');
      expect(content).toContain('"count"');
      expect(content).toContain('"results"');
    });
  });

  test.describe('🔄 Real-time API Interaction', () => {
    
    test('should handle multiple rapid requests', async ({ page }) => {
      await page.setContent(`
        <!DOCTYPE html>
        <html>
        <body>
          <div id="results"></div>
          <script>
            let completedRequests = 0;
            const totalRequests = 5;
            const results = [];
            
            async function makeRequest(index) {
              try {
                const startTime = performance.now();
                const response = await fetch('${API_ENDPOINT}');
                const data = await response.json();
                const endTime = performance.now();
                
                results.push({
                  index: index,
                  status: response.status,
                  count: data.count,
                  responseTime: endTime - startTime
                });
                
                completedRequests++;
                
                if (completedRequests === totalRequests) {
                  window.allRequestsComplete = true;
                  window.requestResults = results;
                }
              } catch (error) {
                results.push({
                  index: index,
                  error: error.message
                });
                completedRequests++;
              }
            }
            
            // Make 5 rapid requests
            for (let i = 0; i < totalRequests; i++) {
              makeRequest(i);
            }
          </script>
        </body>
        </html>
      `);
      
      // Wait for all requests to complete
      await page.waitForFunction(() => window.allRequestsComplete === true, { timeout: 15000 });
      
      const results = await page.evaluate(() => window.requestResults);
      
      // All requests should succeed
      expect(results.length).toBe(5);
      results.forEach((result, index) => {
        expect(result.status).toBe(200);
        expect(result.count).toBeGreaterThanOrEqual(0);
        expect(result.responseTime).toBeLessThan(5000); // 5 seconds max
      });
    });
  });

  test.describe('🎯 User Experience Testing', () => {
    
    test('should provide good user experience when API is slow', async ({ page }) => {
      // Simulate slow network
      await page.route(API_ENDPOINT, async route => {
        // Add 2 second delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        await route.continue();
      });
      
      await page.setContent(`
        <!DOCTYPE html>
        <html>
        <body>
          <div id="loading">Loading events...</div>
          <div id="events" style="display: none;"></div>
          
          <script>
            const startTime = Date.now();
            
            fetch('${API_ENDPOINT}')
              .then(response => response.json())
              .then(data => {
                const loadTime = Date.now() - startTime;
                document.getElementById('loading').style.display = 'none';
                document.getElementById('events').style.display = 'block';
                document.getElementById('events').innerHTML = 
                  \`Loaded \${data.count} events in \${loadTime}ms\`;
                window.loadComplete = true;
                window.loadTime = loadTime;
              });
          </script>
        </body>
        </html>
      `);
      
      // Verify loading state is shown initially
      const loadingText = await page.textContent('#loading');
      expect(loadingText).toBe('Loading events...');
      
      // Wait for load to complete
      await page.waitForFunction(() => window.loadComplete === true, { timeout: 10000 });
      
      // Verify events are displayed
      const eventsText = await page.textContent('#events');
      expect(eventsText).toContain('Loaded');
      expect(eventsText).toContain('events');
      
      const loadTime = await page.evaluate(() => window.loadTime);
      expect(loadTime).toBeGreaterThan(2000); // Should include our 2s delay
    });

    test('should handle API errors gracefully in frontend', async ({ page }) => {
      // Mock API to return error
      await page.route(API_ENDPOINT, route => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Internal server error' })
        });
      });
      
      await page.setContent(`
        <!DOCTYPE html>
        <html>
        <body>
          <div id="events">Loading...</div>
          <div id="error" style="color: red; display: none;"></div>
          
          <script>
            fetch('${API_ENDPOINT}')
              .then(response => {
                if (!response.ok) {
                  throw new Error('API request failed');
                }
                return response.json();
              })
              .then(data => {
                document.getElementById('events').innerHTML = 
                  \`Found \${data.count} events\`;
              })
              .catch(error => {
                document.getElementById('events').style.display = 'none';
                document.getElementById('error').style.display = 'block';
                document.getElementById('error').innerHTML = 
                  'Failed to load events. Please try again later.';
                window.errorHandled = true;
              });
          </script>
        </body>
        </html>
      `);
      
      // Wait for error handling
      await page.waitForFunction(() => window.errorHandled === true, { timeout: 5000 });
      
      // Verify error message is displayed
      const errorText = await page.textContent('#error');
      expect(errorText).toContain('Failed to load events');
      
      // Verify loading text is hidden
      const eventsDiv = await page.locator('#events');
      await expect(eventsDiv).toBeHidden();
    });
  });
});
