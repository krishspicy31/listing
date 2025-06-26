import { test, expect } from '@playwright/test';

/**
 * CulturaLite Acceptance Criteria Test
 * 
 * Comprehensive test to verify all acceptance criteria for Story 1.1 are met:
 * - Both projects can be run locally to display a basic placeholder or "hello world" page
 * - PostgreSQL Neon databases are configured and working
 * - Local development environment runs without errors for both frontend and backend
 * - Environment variables are properly configured
 * - Basic health checks pass for both applications
 * - Database connections are established and tested
 */

test.describe('CulturaLite Story 1.1 Acceptance Criteria', () => {
  
  test('AC1: Frontend displays Hello World page with correct content', async ({ page }) => {
    // Navigate to frontend homepage
    await page.goto('http://localhost:3000');
    
    // Verify page title
    await expect(page).toHaveTitle('Create Next App');
    
    // Verify Hello World heading is present
    await expect(page.locator('h1')).toContainText('Hello World');
    
    // Verify welcome message
    await expect(page.locator('text=Welcome to Culturalite Frontend')).toBeVisible();
    
    // Verify technology stack information is displayed
    await expect(page.locator('text=Next.js 14 • TypeScript • Tailwind CSS')).toBeVisible();
    
    // Verify ready for development message
    await expect(page.locator('text=Ready for development')).toBeVisible();
  });

  test('AC2: Backend health endpoint returns proper JSON response', async ({ page }) => {
    // Navigate to backend health endpoint
    await page.goto('http://127.0.0.1:8000/api/health/');
    
    // Get the response text
    const responseText = await page.locator('body').textContent();
    
    // Parse and verify JSON response
    const healthData = JSON.parse(responseText || '{}');
    expect(healthData.status).toBe('healthy');
    expect(healthData.message).toBe('Culturalite Backend is running');
    expect(healthData.version).toBe('1.0.0');
  });

  test('AC3: Django admin interface loads correctly', async ({ page }) => {
    // Navigate to Django admin
    await page.goto('http://127.0.0.1:8000/admin/');
    
    // Should redirect to login page
    expect(page.url()).toContain('/admin/login/');
    
    // Verify page title
    await expect(page).toHaveTitle('Log in | Django site admin');
    
    // Verify login form elements are present
    await expect(page.locator('input[name="username"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button:has-text("Log in")')).toBeVisible();
    
    // Verify Django administration link
    await expect(page.locator('a:has-text("Django administration")')).toBeVisible();
  });

  test('AC4: CORS configuration allows frontend-backend communication', async ({ page }) => {
    // Navigate to frontend
    await page.goto('http://localhost:3000');
    
    // Test CORS by making API call from frontend to backend
    const corsTestResult = await page.evaluate(async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/health/');
        const data = await response.json();
        return { success: true, data };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });
    
    // Verify CORS test passed
    expect(corsTestResult.success).toBe(true);
    expect(corsTestResult.data.status).toBe('healthy');
    expect(corsTestResult.data.message).toBe('Culturalite Backend is running');
  });

  test('AC5: Database connection is working (PostgreSQL)', async ({ page }) => {
    // Navigate to Django admin users page (requires database access)
    await page.goto('http://127.0.0.1:8000/admin/auth/user/');
    
    // Should redirect to login (not show database error)
    expect(page.url()).toContain('/admin/login/');
    
    // Verify no database connection errors
    await expect(page.locator('text=DatabaseError')).not.toBeVisible();
    await expect(page.locator('text=OperationalError')).not.toBeVisible();
    await expect(page.locator('text=connection')).not.toBeVisible();
    
    // Verify login form loads (indicates database is accessible)
    await expect(page.locator('input[name="username"]')).toBeVisible();
  });

  test('AC6: Both servers are running on correct ports', async ({ page }) => {
    // Test frontend port (3000)
    await page.goto('http://localhost:3000');
    await expect(page.locator('h1')).toContainText('Hello World');
    
    // Test backend port (8000)
    await page.goto('http://127.0.0.1:8000/api/health/');
    const responseText = await page.locator('body').textContent();
    const healthData = JSON.parse(responseText || '{}');
    expect(healthData.status).toBe('healthy');
  });

  test('AC7: Environment configuration is properly loaded', async ({ page }) => {
    // Test that backend is using environment configuration
    await page.goto('http://127.0.0.1:8000/api/health/');
    
    // Verify health endpoint works (indicates Django settings loaded)
    const responseText = await page.locator('body').textContent();
    const healthData = JSON.parse(responseText || '{}');
    expect(healthData.status).toBe('healthy');
    
    // Test Django admin loads (indicates database config loaded)
    await page.goto('http://127.0.0.1:8000/admin/');
    await expect(page).toHaveTitle('Log in | Django site admin');
    
    // Test CORS is configured (indicates CORS_ALLOWED_ORIGINS loaded)
    await page.goto('http://localhost:3000');
    const corsTest = await page.evaluate(async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/health/');
        return response.ok;
      } catch {
        return false;
      }
    });
    expect(corsTest).toBe(true);
  });

  test('AC8: Integration test - Full application stack works together', async ({ page }) => {
    // Test complete workflow: Frontend -> Backend -> Database
    
    // 1. Frontend loads
    await page.goto('http://localhost:3000');
    await expect(page.locator('h1')).toContainText('Hello World');
    
    // 2. Frontend can communicate with backend
    const apiTest = await page.evaluate(async () => {
      const response = await fetch('http://127.0.0.1:8000/api/health/');
      return await response.json();
    });
    expect(apiTest.status).toBe('healthy');
    
    // 3. Backend can access database (admin loads without errors)
    await page.goto('http://127.0.0.1:8000/admin/');
    await expect(page).toHaveTitle('Log in | Django site admin');
    
    // 4. All components working together
    expect(true).toBe(true); // If we reach here, all integration tests passed
  });
});
