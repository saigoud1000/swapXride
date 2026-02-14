import { test, expect } from '@playwright/test';
import * as crypto from 'crypto';

/**
 * Helper to generate a valid JWT for the local E2E environment
 */
const JWT_SECRET_BASE64 = 'VGhpcyBpcyBhIHZlcnkgc2VjcmV0IGtleSBmb3IgdGVzdGluZyE='; // SAFE: Local E2E test secret only
const USER_ID = '11111111-1111-1111-1111-111111111111'; // seller@test.com
const USER_EMAIL = 'seller@test.com';

function generateJwt() {
    const header = { alg: 'HS256', typ: 'JWT' };
    const payload = {
        sub: USER_ID,
        email: USER_EMAIL,
        aud: 'authenticated',
        role: 'authenticated',
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Math.floor(Date.now() / 1000)
    };

    const base64UrlEncode = (str: string) => {
        return Buffer.from(str).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    };

    const encodedHeader = base64UrlEncode(JSON.stringify(header));
    const encodedPayload = base64UrlEncode(JSON.stringify(payload));

    const signatureInput = `${encodedHeader}.${encodedPayload}`;
    const key = Buffer.from(JWT_SECRET_BASE64, 'base64');
    const signature = crypto.createHmac('sha256', key).update(signatureInput).digest('base64')
        .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

    return `${signatureInput}.${signature}`;
}

test.describe('Create Listing Functionality', () => {

    test('should allow a user to create a basic listing', async ({ page }) => {

        // Mock authentication by intercepting the user endpoint
        // This is more robust than injecting localStorage keys
        await page.route('**/auth/v1/user', async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    id: USER_ID,
                    aud: 'authenticated',
                    role: 'authenticated',
                    email: USER_EMAIL,
                    phone: '',
                    app_metadata: { provider: 'email', providers: ['email'] },
                    user_metadata: {},
                    identities: [],
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                })
            });
        });

        // Also mock the session endpoint if the client refreshes it
        await page.route('**/auth/v1/session', async route => {
            const token = generateJwt();
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    access_token: token,
                    token_type: 'bearer',
                    expires_in: 3600,
                    refresh_token: 'mock-refresh-token',
                    user: {
                        id: USER_ID,
                        aud: 'authenticated',
                        role: 'authenticated',
                        email: USER_EMAIL
                    }
                })
            });
        });

        // 2. Navigate to Create Page
        await page.goto('/listings/create');

        // Debug: Log URL to see if we were redirected
        console.log('Current URL:', page.url());

        // Check for Create Listing header
        await expect(page.locator('h1')).toContainText('Create Listing', { timeout: 10000 });

        // Fill form - Robust interaction
        await page.getByLabel('Year').fill('2024');

        // Handle Make Select (Radix UI or native)
        // Try clicking the trigger if it exists
        const makeTrigger = page.locator('button[role="combobox"]').first();
        if (await makeTrigger.isVisible()) {
            await makeTrigger.click();
            await page.getByRole('option', { name: 'BMW' }).first().click();
        } else {
            // Fallback for native select
            const select = page.locator('select').first();
            if (await select.isVisible()) {
                await select.selectOption({ label: 'BMW' });
            } else {
                // Try text input fill as fallback
                await page.getByLabel('Make').fill('BMW');
            }
        }

        await page.getByLabel('Model').fill('M4');
        await page.getByLabel('Trim').fill('Competition');
        await page.getByLabel('Body Type').fill('Coupe');
        await page.getByLabel('Mileage').fill('500');
        await page.getByLabel('Zip Code').fill('90210');
        await page.getByLabel('Description').fill('Test listing UI automation');

        // Submit
        await page.getByRole('button', { name: 'Create Listing' }).click();

        // Expect success message or redirection
        // Adjust expectation based on actual app behavior
        await expect(page.getByText('Listing created successfully')).toBeVisible();
    });
});
