import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
    test('renders main elements', async ({ page }) => {
        await page.goto('/');

        // Check for main heading
        await expect(page.locator('h1')).toBeVisible();
        await expect(page.getByText('SwapXRide Market')).toBeVisible();

        // Check search filters existence
        await expect(page.getByPlaceholder('Search make, model, description...')).toBeVisible();

        // Check listings grid
        // Assuming seeded data has loaded (BMW M3 and Audi RS6 from DataSeeder)
        await expect(page.getByText('BMW')).toBeVisible();
        await expect(page.getByText('Audi')).toBeVisible();
    });
});
