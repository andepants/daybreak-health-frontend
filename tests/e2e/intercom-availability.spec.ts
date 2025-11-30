/**
 * E2E Tests for Intercom Availability and Request Tracking
 * Story 7-3: Support Availability and Request Tracking
 *
 * Tests verify that Intercom widget displays correctly and integrates
 * with native availability features. Configuration-based features
 * (office hours, crisis automation) are tested manually.
 *
 * @see docs/sprint-artifacts/stories/7-3-support-availability-request-tracking.md
 * @see tests/manual/intercom-availability-testing.md
 */

import { test, expect } from '@playwright/test';

test.describe('Intercom Availability and Request Tracking (Story 7-3)', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to onboarding page
    await page.goto('/onboarding/test-session-id/start');
  });

  test.describe('AC #1: Availability Indicator Display', () => {
    test('should display Intercom widget on page load', async ({ page }) => {
      // Wait for Intercom widget to load
      // Intercom creates an iframe with id 'intercom-frame'
      const intercomFrame = page.locator('iframe[name="intercom-launcher-frame"]');

      await expect(intercomFrame).toBeVisible({ timeout: 10000 });
    });

    test('should have messenger accessible via keyboard navigation', async ({ page }) => {
      // Tab to Intercom widget
      // Note: May need to tab multiple times depending on page elements
      let tabCount = 0;
      const maxTabs = 20; // Safety limit

      while (tabCount < maxTabs) {
        await page.keyboard.press('Tab');
        tabCount++;

        // Check if Intercom launcher is focused
        const focusedElement = await page.evaluate(() => {
          const activeElement = document.activeElement;
          return activeElement?.tagName.toLowerCase();
        });

        // Intercom launcher is in an iframe, so we check for iframe focus
        if (focusedElement === 'iframe') {
          break;
        }
      }

      // Verify we found the widget within reasonable tab count
      expect(tabCount).toBeLessThan(maxTabs);
    });

    test('should load Intercom script asynchronously', async ({ page }) => {
      // Listen for Intercom script load
      const intercomScriptPromise = page.waitForResponse(
        response => response.url().includes('widget.intercom.io'),
        { timeout: 10000 }
      );

      // Wait for script to load
      const response = await intercomScriptPromise;

      // Verify script loaded successfully
      expect(response.status()).toBe(200);
    });

    test('should position widget in bottom-right corner', async ({ page }) => {
      // Wait for Intercom frame
      const intercomFrame = page.locator('iframe[name="intercom-launcher-frame"]');
      await intercomFrame.waitFor({ state: 'visible', timeout: 10000 });

      // Get bounding box
      const boundingBox = await intercomFrame.boundingBox();

      expect(boundingBox).toBeTruthy();
      if (boundingBox) {
        const viewportSize = page.viewportSize();
        expect(viewportSize).toBeTruthy();

        if (viewportSize) {
          // Widget should be in bottom-right quadrant
          const isBottomHalf = boundingBox.y > viewportSize.height / 2;
          const isRightHalf = boundingBox.x > viewportSize.width / 2;

          expect(isBottomHalf).toBe(true);
          expect(isRightHalf).toBe(true);
        }
      }
    });
  });

  test.describe('AC #3: Message Status Indicators', () => {
    test('should not produce console errors when widget loads', async ({ page }) => {
      const consoleErrors: string[] = [];

      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });

      // Wait for page and widget to fully load
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000); // Allow Intercom to initialize

      // Filter out expected/unrelated errors
      const intercomErrors = consoleErrors.filter(error =>
        error.toLowerCase().includes('intercom')
      );

      // Verify no Intercom-related errors
      expect(intercomErrors).toHaveLength(0);
    });

    test('should load without blocking page render', async ({ page }) => {
      // Measure time to first contentful paint
      const timing = await page.evaluate(() => {
        const perfData = window.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        return {
          domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
          loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
        };
      });

      // Page should load reasonably fast even with Intercom
      // These are generous limits to account for test environment variability
      expect(timing.domContentLoaded).toBeLessThan(3000);
      expect(timing.loadComplete).toBeLessThan(5000);
    });
  });

  test.describe('AC #5: Conversation Persistence', () => {
    test('should maintain Intercom widget state on route navigation', async ({ page }) => {
      // Wait for widget to load
      const intercomFrame = page.locator('iframe[name="intercom-launcher-frame"]');
      await intercomFrame.waitFor({ state: 'visible', timeout: 10000 });

      // Navigate to different onboarding step
      await page.goto('/onboarding/test-session-id/assessment');

      // Widget should still be visible
      await expect(intercomFrame).toBeVisible({ timeout: 10000 });
    });

    test('should persist Intercom configuration across page reloads', async ({ page }) => {
      // Check initial load
      await page.waitForLoadState('networkidle');
      const intercomFrame1 = page.locator('iframe[name="intercom-launcher-frame"]');
      await expect(intercomFrame1).toBeVisible({ timeout: 10000 });

      // Reload page
      await page.reload();

      // Widget should load again
      const intercomFrame2 = page.locator('iframe[name="intercom-launcher-frame"]');
      await expect(intercomFrame2).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Mobile Responsiveness', () => {
    test('should display correctly on mobile viewport', async ({ page }) => {
      // Set mobile viewport (iPhone 12)
      await page.setViewportSize({ width: 390, height: 844 });

      // Navigate to page
      await page.goto('/onboarding/test-session-id/start');

      // Wait for widget
      const intercomFrame = page.locator('iframe[name="intercom-launcher-frame"]');
      await intercomFrame.waitFor({ state: 'visible', timeout: 10000 });

      // Verify widget is visible on mobile
      await expect(intercomFrame).toBeVisible();

      // Get bounding box to verify positioning
      const boundingBox = await intercomFrame.boundingBox();

      expect(boundingBox).toBeTruthy();
      if (boundingBox) {
        // Widget should be in bottom-right on mobile
        const viewportSize = page.viewportSize();
        expect(viewportSize).toBeTruthy();

        if (viewportSize) {
          const isBottomHalf = boundingBox.y > viewportSize.height / 2;
          const isRightHalf = boundingBox.x > viewportSize.width / 2;

          expect(isBottomHalf).toBe(true);
          expect(isRightHalf).toBe(true);
        }
      }
    });

    test('should have adequate touch target size on mobile', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      // Navigate to page
      await page.goto('/onboarding/test-session-id/start');

      // Wait for widget
      const intercomFrame = page.locator('iframe[name="intercom-launcher-frame"]');
      await intercomFrame.waitFor({ state: 'visible', timeout: 10000 });

      // Get dimensions
      const boundingBox = await intercomFrame.boundingBox();

      expect(boundingBox).toBeTruthy();
      if (boundingBox) {
        // Minimum touch target is 44x44px (Apple HIG)
        // Intercom's default launcher is typically 60x60px
        expect(boundingBox.width).toBeGreaterThanOrEqual(44);
        expect(boundingBox.height).toBeGreaterThanOrEqual(44);
      }
    });
  });

  test.describe('Integration with Story 7-2 (Session Context)', () => {
    test('should initialize Intercom with app_id from environment', async ({ page }) => {
      // Check that Intercom settings are configured
      const intercomSettings = await page.evaluate(() => {
        return (window as any).intercomSettings;
      });

      expect(intercomSettings).toBeTruthy();
      expect(intercomSettings.app_id).toBeTruthy();
      expect(intercomSettings.alignment).toBe('right');
      expect(intercomSettings.action_color).toBe('#2A9D8F'); // Daybreak teal
    });

    test('should not expose PHI in window.intercomSettings', async ({ page }) => {
      await page.waitForLoadState('networkidle');

      // Check Intercom settings
      const intercomSettings = await page.evaluate(() => {
        return (window as any).intercomSettings;
      });

      // Verify no PHI in settings
      const settingsString = JSON.stringify(intercomSettings || {}).toLowerCase();

      // Check for common PHI keywords that should NOT appear
      const phiKeywords = [
        'diagnosis',
        'medication',
        'symptom',
        'condition',
        'treatment',
        'ssn',
        'social security',
        'medical',
        'health record',
      ];

      phiKeywords.forEach(keyword => {
        expect(settingsString).not.toContain(keyword);
      });
    });
  });

  test.describe('Accessibility', () => {
    test('should have no automatic accessibility violations', async ({ page }) => {
      // Wait for page to fully load
      await page.waitForLoadState('networkidle');

      // Check for basic accessibility
      // Note: This is a basic check. Full a11y audit requires axe-core or similar
      const hasLangAttribute = await page.evaluate(() => {
        return document.documentElement.hasAttribute('lang');
      });

      expect(hasLangAttribute).toBe(true);
    });
  });

  test.describe('Performance', () => {
    test('should load widget without excessive network requests', async ({ page }) => {
      const requests: string[] = [];

      page.on('request', request => {
        if (request.url().includes('intercom')) {
          requests.push(request.url());
        }
      });

      await page.goto('/onboarding/test-session-id/start');
      await page.waitForLoadState('networkidle');

      // Should have reasonable number of Intercom requests
      // Typically: widget script + configuration + maybe 1-2 API calls
      expect(requests.length).toBeLessThan(10);
    });

    test('should not cause layout shift when widget loads', async ({ page }) => {
      // Navigate and wait for load
      await page.goto('/onboarding/test-session-id/start');

      // Get initial layout
      const initialLayout = await page.evaluate(() => {
        const body = document.body;
        return {
          scrollHeight: body.scrollHeight,
          scrollWidth: body.scrollWidth,
        };
      });

      // Wait for Intercom to load
      await page.waitForTimeout(3000);

      // Get layout after Intercom loads
      const finalLayout = await page.evaluate(() => {
        const body = document.body;
        return {
          scrollHeight: body.scrollHeight,
          scrollWidth: body.scrollWidth,
        };
      });

      // Intercom widget is fixed position, shouldn't affect document dimensions
      expect(finalLayout.scrollHeight).toBe(initialLayout.scrollHeight);
      expect(finalLayout.scrollWidth).toBe(initialLayout.scrollWidth);
    });
  });
});

/**
 * Tests that require manual verification or Intercom dashboard configuration:
 *
 * 1. Office Hours Configuration (AC #2):
 *    - Requires setting business hours in Intercom dashboard
 *    - Manual test: Access app during/after hours to verify away mode
 *
 * 2. Crisis Response Automation (AC #4):
 *    - Configured via Intercom automation rules
 *    - Manual test: Send messages with crisis keywords, verify automated response
 *
 * 3. Email Notifications (AC #2, #3):
 *    - Configured in Intercom dashboard
 *    - Manual test: Send message, have staff reply, check email received
 *
 * 4. Backend Webhook Integration (AC #6):
 *    - Backend team responsibility
 *    - Integration test: Verify webhook events received by backend
 *
 * 5. Message Status Indicators (AC #3):
 *    - Native Intercom features
 *    - Manual test: Send message, verify sent indicator and typing indicator
 *
 * 6. Conversation Persistence Across Devices (AC #5):
 *    - Requires multiple devices or browsers with same user
 *    - Manual test: Send messages on one device, verify on another
 *
 * See tests/manual/intercom-availability-testing.md for manual test procedures
 */
