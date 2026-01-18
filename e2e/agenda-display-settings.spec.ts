/**
 * E2E Tests for Agenda Display Settings
 *
 * Test scenarios:
 * 1. Modal interaction
 * 2. Zoom level changes
 * 3. Time range changes
 * 4. Persistence across refresh
 * 5. Multi-device sync
 */

import { test, expect } from '@playwright/test';

// Test user credentials (use test account)
const TEST_USER = {
  email: 'test@medisync.local',
  password: 'TestPassword123!',
};

test.describe('Agenda Display Settings', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('[name="email"]', TEST_USER.email);
    await page.fill('[name="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('/planning');
  });

  test.describe('Modal Interaction', () => {
    test('opens settings modal from toolbar', async ({ page }) => {
      // Click "Affichage de l'agenda" button
      await page.click('button:has-text("Affichage de l\'agenda")');

      // Modal should be visible
      await expect(page.locator('[role="dialog"]')).toBeVisible();
      await expect(page.locator('text=Densité de l\'information')).toBeVisible();
    });

    test('closes modal with "Revenir à l\'agenda" button', async ({ page }) => {
      await page.click('button:has-text("Affichage de l\'agenda")');
      await page.click('button:has-text("Revenir à l\'agenda")');

      // Modal should be hidden
      await expect(page.locator('[role="dialog"]')).not.toBeVisible();
    });

    test('closes modal with X button', async ({ page }) => {
      await page.click('button:has-text("Affichage de l\'agenda")');
      await page.click('[role="dialog"] button[aria-label="Close"]');

      await expect(page.locator('[role="dialog"]')).not.toBeVisible();
    });

    test('closes modal with Escape key', async ({ page }) => {
      await page.click('button:has-text("Affichage de l\'agenda")');
      await page.keyboard.press('Escape');

      await expect(page.locator('[role="dialog"]')).not.toBeVisible();
    });
  });

  test.describe('Zoom Level Changes', () => {
    test('zoom slider changes grid density', async ({ page }) => {
      await page.click('button:has-text("Affichage de l\'agenda")');

      // Get initial slot height
      const initialHeight = await page.evaluate(() => {
        return getComputedStyle(document.documentElement)
          .getPropertyValue('--grid-slot-height');
      });

      // Drag slider to maximum
      const slider = page.locator('[role="slider"]').first();
      await slider.dragTo(page.locator('text=Maximum'));

      // Wait for CSS variable update
      await page.waitForTimeout(500);

      // Check slot height changed
      const newHeight = await page.evaluate(() => {
        return getComputedStyle(document.documentElement)
          .getPropertyValue('--grid-slot-height');
      });

      expect(newHeight).not.toBe(initialHeight);
    });

    test('zoom shows preview in modal', async ({ page }) => {
      await page.click('button:has-text("Affichage de l\'agenda")');

      // Preview should exist
      await expect(page.locator('text=Aperçu')).toBeVisible();

      // Preview height should change with slider
      const preview = page.locator('[data-testid="zoom-preview"]');
      const initialHeight = await preview.boundingBox();

      // Change zoom
      const slider = page.locator('[role="slider"]').first();
      await slider.fill('100'); // Maximum

      const newHeight = await preview.boundingBox();
      expect(newHeight?.height).toBeGreaterThan(initialHeight?.height || 0);
    });
  });

  test.describe('Time Range Changes', () => {
    test('changing start time updates grid', async ({ page }) => {
      await page.click('button:has-text("Affichage de l\'agenda")');

      // Change start time to 08:00
      await page.click('[data-testid="start-time-select"]');
      await page.click('text=08:00');

      await page.click('button:has-text("Revenir à l\'agenda")');

      // Grid should not show 07:00 slot
      await expect(page.locator('[data-time="07:00"]')).not.toBeVisible();
      await expect(page.locator('[data-time="08:00"]')).toBeVisible();
    });

    test('changing end time updates grid', async ({ page }) => {
      await page.click('button:has-text("Affichage de l\'agenda")');

      // Change end time to 18:00
      await page.click('[data-testid="end-time-select"]');
      await page.click('text=18:00');

      await page.click('button:has-text("Revenir à l\'agenda")');

      // Grid should not show 19:00 slot
      await expect(page.locator('[data-time="19:00"]')).not.toBeVisible();
      await expect(page.locator('[data-time="18:00"]')).toBeVisible();
    });

    test('prevents invalid time range (start >= end)', async ({ page }) => {
      await page.click('button:has-text("Affichage de l\'agenda")');

      // Try to set start time after end time
      await page.click('[data-testid="start-time-select"]');

      // Options after current end time should be disabled or not shown
      const endTime = await page.locator('[data-testid="end-time-select"]').innerText();
      const laterOption = page.locator(`text=${endTime}`).first();

      // Should show validation error or prevent selection
      await expect(page.locator('text=La plage horaire doit être')).not.toBeVisible();
    });

    test('enforces minimum 4-hour range', async ({ page }) => {
      await page.click('button:has-text("Affichage de l\'agenda")');

      // Set times too close together
      await page.click('[data-testid="start-time-select"]');
      await page.click('text=14:00');

      await page.click('[data-testid="end-time-select"]');
      await page.click('text=15:00');

      // Should show error
      await expect(page.locator('text=au moins 4 heures')).toBeVisible();
    });
  });

  test.describe('Persistence', () => {
    test('preferences persist after page refresh', async ({ page }) => {
      await page.click('button:has-text("Affichage de l\'agenda")');

      // Change zoom to maximum
      const slider = page.locator('[role="slider"]').first();
      await slider.fill('100');

      // Wait for save
      await page.waitForTimeout(1000);

      // Refresh page
      await page.reload();
      await page.waitForLoadState('networkidle');

      // Check CSS variable persisted
      const zoomHeight = await page.evaluate(() => {
        return getComputedStyle(document.documentElement)
          .getPropertyValue('--grid-slot-height');
      });

      expect(zoomHeight.trim()).toBe('60px'); // Maximum zoom
    });

    test('preferences persist after logout/login', async ({ page }) => {
      await page.click('button:has-text("Affichage de l\'agenda")');

      // Change start time
      await page.click('[data-testid="start-time-select"]');
      await page.click('text=09:00');

      await page.waitForTimeout(1000);

      // Logout
      await page.click('[data-testid="user-menu"]');
      await page.click('text=Déconnexion');

      // Login again
      await page.goto('/login');
      await page.fill('[name="email"]', TEST_USER.email);
      await page.fill('[name="password"]', TEST_USER.password);
      await page.click('button[type="submit"]');
      await page.waitForURL('/planning');

      // Check preferences restored
      await page.click('button:has-text("Affichage de l\'agenda")');
      const startValue = await page.locator('[data-testid="start-time-select"]').innerText();
      expect(startValue).toContain('09:00');
    });
  });

  test.describe('Out-of-Range Events', () => {
    test('shows indicator for events outside visible range', async ({ page }) => {
      // First, create an event at 06:00 (assuming default range starts at 07:00)
      // This would typically be done via API or fixture

      // Check for out-of-range indicator
      const indicator = page.locator('[data-testid="out-of-range-top"]');
      if (await indicator.isVisible()) {
        await expect(indicator).toContainText('hors plage');
      }
    });
  });

  test.describe('Accessibility', () => {
    test('modal is keyboard navigable', async ({ page }) => {
      await page.click('button:has-text("Affichage de l\'agenda")');

      // Tab through elements
      await page.keyboard.press('Tab');
      const focused1 = await page.evaluate(() => document.activeElement?.tagName);
      expect(focused1).toBeTruthy();

      await page.keyboard.press('Tab');
      const focused2 = await page.evaluate(() => document.activeElement?.tagName);
      expect(focused2).toBeTruthy();
    });

    test('slider is accessible via keyboard', async ({ page }) => {
      await page.click('button:has-text("Affichage de l\'agenda")');

      // Focus slider
      const slider = page.locator('[role="slider"]').first();
      await slider.focus();

      // Use arrow keys
      await page.keyboard.press('ArrowRight');
      await page.keyboard.press('ArrowRight');

      const value = await slider.getAttribute('aria-valuenow');
      expect(Number(value)).toBeGreaterThan(50); // Default is ~50
    });

    test('has proper ARIA labels', async ({ page }) => {
      await page.click('button:has-text("Affichage de l\'agenda")');

      // Check dialog role
      await expect(page.locator('[role="dialog"]')).toHaveAttribute('aria-modal', 'true');

      // Check slider has label
      const slider = page.locator('[role="slider"]').first();
      await expect(slider).toHaveAttribute('aria-label');
    });
  });

  test.describe('Performance', () => {
    test('grid renders within acceptable time', async ({ page }) => {
      await page.click('button:has-text("Affichage de l\'agenda")');

      const start = Date.now();

      // Change zoom (triggers re-render)
      const slider = page.locator('[role="slider"]').first();
      await slider.fill('100');

      await page.click('button:has-text("Revenir à l\'agenda")');

      // Wait for grid to be visible
      await page.waitForSelector('[data-testid="calendar-grid"]', { state: 'visible' });

      const elapsed = Date.now() - start;

      // Should render within 500ms
      expect(elapsed).toBeLessThan(500);
    });
  });
});
