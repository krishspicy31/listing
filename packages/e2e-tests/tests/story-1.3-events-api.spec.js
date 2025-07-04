/**
 * Playwright Test Suite for Story 1.3: Create Public API for Approved Events
 * 
 * Tests all acceptance criteria and scenarios from story-1.3-test-scenarios.md
 * 
 * Story Context:
 * - As a Frontend Developer, I want a public, read-only API endpoint that returns 
 *   a list of all approved events so that I can fetch and display them on public pages
 * 
 * Test Coverage:
 * - Basic API functionality and authentication
 * - Event data validation and structure
 * - Filtering (city, category, combined)
 * - Pagination and error handling
 * - Security and performance tests
 */

const { test, expect } = require('@playwright/test');

// Test configuration
const BASE_URL = 'http://localhost:8000';
const API_ENDPOINT = `${BASE_URL}/api/events/`;

test.describe('Story 1.3: Public Events API', () => {
  
  test.beforeEach(async ({ page }) => {
    // Set up any necessary test state
    console.log('Starting test for Events API endpoint');
  });

  test.describe('🔐 Authentication & Authorization', () => {
    
    test('should allow public access without authentication', async ({ request }) => {
      const response = await request.get(API_ENDPOINT);
      
      expect(response.status()).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('count');
      expect(data).toHaveProperty('results');
      expect(Array.isArray(data.results)).toBe(true);
    });

    test('should handle invalid authentication headers appropriately', async ({ request }) => {
      const response = await request.get(API_ENDPOINT, {
        headers: {
          'Authorization': 'Bearer invalid-token-12345'
        }
      });

      // Note: DRF may return 401 for invalid tokens, which is acceptable behavior
      // The important thing is that the endpoint is accessible without auth
      expect([200, 401]).toContain(response.status());

      if (response.status() === 200) {
        const data = await response.json();
        expect(data).toHaveProperty('results');
      }
    });

    test('should only allow GET method', async ({ request }) => {
      // Test POST method
      const postResponse = await request.post(API_ENDPOINT, {
        data: { test: 'data' }
      });
      expect(postResponse.status()).toBe(405);
      
      // Test PUT method
      const putResponse = await request.put(API_ENDPOINT, {
        data: { test: 'data' }
      });
      expect(putResponse.status()).toBe(405);
      
      // Test DELETE method
      const deleteResponse = await request.delete(API_ENDPOINT);
      expect(deleteResponse.status()).toBe(405);
    });
  });

  test.describe('📊 Event Data Validation', () => {
    
    test('should return events with exact required fields', async ({ request }) => {
      const response = await request.get(API_ENDPOINT);
      expect(response.status()).toBe(200);
      
      const data = await response.json();
      expect(data.results.length).toBeGreaterThan(0);
      
      // Validate first event structure
      const event = data.results[0];
      const requiredFields = ['id', 'title', 'description', 'city', 'event_date', 'image_url', 'category'];
      
      requiredFields.forEach(field => {
        expect(event).toHaveProperty(field);
      });
      
      // Validate data types
      expect(typeof event.id).toBe('number');
      expect(typeof event.title).toBe('string');
      expect(typeof event.description).toBe('string');
      expect(typeof event.city).toBe('string');
      expect(typeof event.event_date).toBe('string');
      expect(typeof event.image_url).toBe('string');
      expect(typeof event.category).toBe('object');
    });

    test('should have nested category object with name and slug', async ({ request }) => {
      const response = await request.get(API_ENDPOINT);
      const data = await response.json();
      
      const event = data.results[0];
      expect(event.category).toHaveProperty('name');
      expect(event.category).toHaveProperty('slug');
      expect(typeof event.category.name).toBe('string');
      expect(typeof event.category.slug).toBe('string');
    });

    test('should have event_date in ISO 8601 format', async ({ request }) => {
      const response = await request.get(API_ENDPOINT);
      const data = await response.json();
      
      const event = data.results[0];
      const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
      expect(event.event_date).toMatch(isoDateRegex);
      
      // Verify it's a valid date
      const date = new Date(event.event_date);
      expect(date.toString()).not.toBe('Invalid Date');
    });
  });

  test.describe('🔍 Filtering Functionality', () => {
    
    test('should filter events by city (case-insensitive)', async ({ request }) => {
      // Test with proper case
      const response1 = await request.get(`${API_ENDPOINT}?city=Chennai`);
      expect(response1.status()).toBe(200);
      
      const data1 = await response1.json();
      expect(data1.count).toBeGreaterThan(0);
      
      // Verify all events are from Chennai
      data1.results.forEach(event => {
        expect(event.city.toLowerCase()).toBe('chennai');
      });
      
      // Test with lowercase
      const response2 = await request.get(`${API_ENDPOINT}?city=chennai`);
      const data2 = await response2.json();
      
      // Should return same results (case-insensitive)
      expect(data2.count).toBe(data1.count);
    });

    test('should filter events by category (case-insensitive)', async ({ request }) => {
      // Test with proper case
      const response1 = await request.get(`${API_ENDPOINT}?category=Dance`);
      expect(response1.status()).toBe(200);
      
      const data1 = await response1.json();
      expect(data1.count).toBeGreaterThan(0);
      
      // Verify all events are from Dance category
      data1.results.forEach(event => {
        expect(event.category.name.toLowerCase()).toBe('dance');
      });
      
      // Test with lowercase
      const response2 = await request.get(`${API_ENDPOINT}?category=dance`);
      const data2 = await response2.json();
      
      // Should return same results (case-insensitive)
      expect(data2.count).toBe(data1.count);
    });

    test('should support combined filtering', async ({ request }) => {
      const response = await request.get(`${API_ENDPOINT}?city=Chennai&category=Dance`);
      expect(response.status()).toBe(200);
      
      const data = await response.json();
      
      // Verify all events match both filters
      data.results.forEach(event => {
        expect(event.city.toLowerCase()).toBe('chennai');
        expect(event.category.name.toLowerCase()).toBe('dance');
      });
    });

    test('should handle non-existent filters gracefully', async ({ request }) => {
      // Non-existent city
      const response1 = await request.get(`${API_ENDPOINT}?city=NonExistentCity`);
      expect(response1.status()).toBe(200);
      
      const data1 = await response1.json();
      expect(data1.count).toBe(0);
      expect(data1.results).toEqual([]);
      
      // Non-existent category
      const response2 = await request.get(`${API_ENDPOINT}?category=NonExistentCategory`);
      expect(response2.status()).toBe(200);
      
      const data2 = await response2.json();
      expect(data2.count).toBe(0);
      expect(data2.results).toEqual([]);
    });
  });

  test.describe('📄 Pagination', () => {
    
    test('should include pagination metadata', async ({ request }) => {
      const response = await request.get(API_ENDPOINT);
      expect(response.status()).toBe(200);
      
      const data = await response.json();
      
      // Check pagination structure
      expect(data).toHaveProperty('count');
      expect(data).toHaveProperty('next');
      expect(data).toHaveProperty('previous');
      expect(data).toHaveProperty('results');
      
      expect(typeof data.count).toBe('number');
      expect(data.count).toBeGreaterThan(0);
    });

    test('should handle page navigation correctly', async ({ request }) => {
      // Get first page
      const response1 = await request.get(API_ENDPOINT);
      const data1 = await response1.json();
      
      if (data1.next) {
        // Get second page
        const response2 = await request.get(`${API_ENDPOINT}?page=2`);
        expect(response2.status()).toBe(200);
        
        const data2 = await response2.json();
        expect(data2).toHaveProperty('previous');
        expect(data2.previous).toContain(BASE_URL);
      }
    });

    test('should return 404 for invalid page numbers', async ({ request }) => {
      // Test invalid page numbers that should return 404
      const invalidPages = ['999', '0', '-1', 'abc'];
      
      for (const page of invalidPages) {
        const response = await request.get(`${API_ENDPOINT}?page=${page}`);
        expect(response.status()).toBe(404);
        
        const data = await response.json();
        expect(data).toHaveProperty('detail');
        expect(data.detail).toContain('Invalid page');
      }
    });
  });

  test.describe('🔒 Security', () => {
    
    test('should prevent XSS attacks in query parameters', async ({ request }) => {
      const xssPayload = '<script>alert("xss")</script>';
      const response = await request.get(`${API_ENDPOINT}?city=${encodeURIComponent(xssPayload)}`);
      
      expect(response.status()).toBe(200);
      
      const data = await response.json();
      expect(data.count).toBe(0);
      expect(data.results).toEqual([]);
    });

    test('should prevent SQL injection in query parameters', async ({ request }) => {
      const sqlPayload = "'; DROP TABLE events; --";
      const response = await request.get(`${API_ENDPOINT}?category=${encodeURIComponent(sqlPayload)}`);
      
      expect(response.status()).toBe(200);
      
      const data = await response.json();
      expect(data.count).toBe(0);
      expect(data.results).toEqual([]);
    });

    test('should handle null byte injection safely', async ({ request }) => {
      const nullBytePayload = '%00%00%00';
      const response = await request.get(`${API_ENDPOINT}?city=${nullBytePayload}`);

      // Django properly rejects null bytes with 400 Bad Request, which is good security
      expect([200, 400]).toContain(response.status());

      if (response.status() === 200) {
        const data = await response.json();
        expect(data.count).toBe(0);
        expect(data.results).toEqual([]);
      } else {
        // 400 response indicates proper null byte rejection
        const data = await response.json();
        expect(data).toHaveProperty('error');
      }
    });
  });

  test.describe('⚡ Performance', () => {
    
    test('should respond within acceptable time limits', async ({ request }) => {
      const startTime = Date.now();
      
      const response = await request.get(API_ENDPOINT);
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      expect(response.status()).toBe(200);
      expect(responseTime).toBeLessThan(2000); // 2 seconds max (generous for CI)
      
      console.log(`API response time: ${responseTime}ms`);
    });

    test('should handle concurrent requests efficiently', async ({ request }) => {
      const promises = [];
      const requestCount = 5;
      
      // Make 5 concurrent requests
      for (let i = 0; i < requestCount; i++) {
        promises.push(request.get(API_ENDPOINT));
      }
      
      const startTime = Date.now();
      const responses = await Promise.all(promises);
      const endTime = Date.now();
      
      // All requests should succeed
      responses.forEach(response => {
        expect(response.status()).toBe(200);
      });
      
      const totalTime = endTime - startTime;
      console.log(`${requestCount} concurrent requests completed in: ${totalTime}ms`);
      
      // Should complete within reasonable time
      expect(totalTime).toBeLessThan(5000);
    });
  });

  test.describe('🚨 Error Handling', () => {
    
    test('should handle invalid query parameters gracefully', async ({ request }) => {
      const response = await request.get(`${API_ENDPOINT}?invalid_param=test&another_invalid=value`);
      
      expect(response.status()).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('results');
      // Invalid parameters should be ignored, not cause errors
    });

    test('should return proper error format for invalid pages', async ({ request }) => {
      const response = await request.get(`${API_ENDPOINT}?page=999`);
      
      expect(response.status()).toBe(404);
      
      const data = await response.json();
      expect(data).toHaveProperty('detail');
      expect(typeof data.detail).toBe('string');
    });
  });

  test.describe('🔄 Integration Tests', () => {
    
    test('should maintain data consistency across requests', async ({ request }) => {
      // Make multiple requests and verify consistent data
      const response1 = await request.get(API_ENDPOINT);
      const data1 = await response1.json();
      
      const response2 = await request.get(API_ENDPOINT);
      const data2 = await response2.json();
      
      expect(data1.count).toBe(data2.count);
      expect(data1.results.length).toBe(data2.results.length);
      
      // First event should be the same (assuming stable ordering)
      if (data1.results.length > 0) {
        expect(data1.results[0].id).toBe(data2.results[0].id);
      }
    });

    test('should work correctly with browser navigation', async ({ page }) => {
      await page.goto(API_ENDPOINT);
      
      // Should display JSON response
      const content = await page.textContent('body');
      expect(content).toContain('"count"');
      expect(content).toContain('"results"');
      
      // Take screenshot for visual verification
      await page.screenshot({ 
        path: 'test-results/api-endpoint-browser.png',
        fullPage: true 
      });
    });
  });
});
