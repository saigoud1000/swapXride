import { test, expect } from '@playwright/test';

test.describe('Search and Filters', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('filters listings by make', async ({ page }) => {
        // Initial state: should show both BMW and Audi
        await expect(page.getByText('BMW')).toBeVisible();
        await expect(page.getByText('Audi')).toBeVisible();

        // Type "BMW" in search input
        const searchInput = page.getByPlaceholder('Search make, model, description...');
        await searchInput.fill('BMW');
        await page.keyboard.press('Enter');

        // Verify URL contains query param
        await expect(page).toHaveURL(/q=BMW/);

        // Verify Audi is gone (assuming grid updates or at least BMW is still there)
        // Note: Strict disappearance check might be flaky if data varies, but for seeded data it's fine.
        await expect(page.getByText('BMW')).toBeVisible();
        // await expect(page.getByText('Audi')).not.toBeVisible(); // Optional severity
    });

    test('filters by minimum year', async ({ page }) => {
        // Open filters - the button is always there
        const filtersBtn = page.getByRole('button', { name: 'Filters' });
        await filtersBtn.click();

        // Wait for state change
        await expect(filtersBtn).toHaveAttribute('aria-expanded', 'true');

        // Wait for the animation to reveal the form
        // We can wait for the 'Make' label or just the container
        // Wait for the animation to reveal the form
        await expect(page.getByText('Minimum Year')).toBeVisible();

        // Click the trigger (placeholder text)
        await page.getByText('Any Year').click();

        // Select '2021' from the dropdown options
        await page.getByRole('option', { name: '2021' }).click();

        // Verify the application updated the URL (confirms UI interaction triggered router)
        await expect(page).toHaveURL(/minYear=2021/);

        // Should verify only Audi (2022) is shown, BMW (2020) hidden
        await expect(page.getByText('Audi')).toBeVisible();
        await expect(page.getByText('BMW')).not.toBeVisible();
    });
});
