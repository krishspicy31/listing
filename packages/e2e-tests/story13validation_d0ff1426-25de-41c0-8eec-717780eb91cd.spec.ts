
import { test } from '@playwright/test';
import { expect } from '@playwright/test';

test('Story13Validation_2025-07-03', async ({ page, context }) => {
  
    // Navigate to URL
    await page.goto('http://localhost:8000/api/events/');

    // Take screenshot
    await page.screenshot({ path: 'story-1-3-api-endpoint-basic-access.png', { fullPage: true } });

    // Navigate to URL
    await page.goto('http://localhost:8000/api/events/?city=Chennai');

    // Take screenshot
    await page.screenshot({ path: 'story-1-3-city-filtering-chennai.png', { fullPage: true } });

    // Navigate to URL
    await page.goto('http://localhost:8000/api/events/?city=chennai');

    // Navigate to URL
    await page.goto('http://localhost:8000/api/events/?category=Dance');

    // Navigate to URL
    await page.goto('http://localhost:8000/api/events/?city=Chennai&category=Dance');

    // Take screenshot
    await page.screenshot({ path: 'story-1-3-combined-filtering.png', { fullPage: true } });

    // Navigate to URL
    await page.goto('http://localhost:8000/api/events/?page=2');

    // Navigate to URL
    await page.goto('http://localhost:8000/api/events/?page=999');

    // Take screenshot
    await page.screenshot({ path: 'story-1-3-invalid-page-404-fixed.png', { fullPage: true } });

    // Navigate to URL
    await page.goto('http://localhost:8000/api/events/');

    // Navigate to URL
    await page.goto('http://localhost:8000/api/events/?city=<script>alert('xss')</script>');

    // Take screenshot
    await page.screenshot({ path: 'story-1-3-validation-complete.png', { fullPage: true } });
});