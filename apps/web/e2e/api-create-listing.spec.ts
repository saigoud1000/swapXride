import { test, expect } from '@playwright/test';
import * as crypto from 'crypto';

const JWT_SECRET_BASE64 = 'VGhpcyBpcyBhIHZlcnkgc2VjcmV0IGtleSBmb3IgdGVzdGluZyE=';
const USER_ID = '11111111-1111-1111-1111-111111111111'; // seller@test.com from DataSeeder
const USER_EMAIL = 'seller@test.com';

function generateJwt() {
    const header = { alg: 'HS256', typ: 'JWT' };
    const payload = {
        sub: USER_ID, // Use sub for ID in our logic? details in JwtService use extraClaims or subject?
        // JwtService.extractUsername uses "email" claim or subject?
        // extractUsername calls claims.get("email", String.class)
        // extractUserId calls claims.getSubject()
        // So sub = ID, email = email
        email: USER_EMAIL,
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

test.describe('API Create Listing Flow', () => {
    test('should create a new listing and retrieve it', async ({ request }) => {
        const token = generateJwt();

        // 1. Create Listing
        const newListing = {
            have_year: 2024,
            have_make: 'Porsche',
            have_model: '911',
            have_trim: 'GT3',
            body_type: 'coupe',
            have_mileage: 1200,
            location_zip: '90001',
            want_description: 'Looking for a Urus',
            description: 'Brand new GT3, track ready.',
            condition: 'like_new',
            title_status: 'clean',
            modifications: 'None'
        };

        const createResponse = await request.post('http://localhost:8080/api/v1/listings', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            data: newListing
        });

        // Debug response if failed
        if (!createResponse.ok()) {
            console.log(await createResponse.text());
        }

        expect(createResponse.status()).toBe(200);
        const createdListing = await createResponse.json();
        expect(createdListing.id).toBeDefined();
        expect(createdListing.have_make).toBe('Porsche');
        expect(createdListing.status).toBe('active');
        expect(createdListing.is_paid).toBe(false); // Default should be free/basic

        // 2. Verify it exists via GET
        const getResponse = await request.get(`http://localhost:8080/api/v1/listings/${createdListing.id}`);
        expect(getResponse.status()).toBe(200);
        const fetchedListing = await getResponse.json();
        expect(fetchedListing.have_model).toBe('911');

        // 3. Verify it appears in search
        const searchResponse = await request.get('http://localhost:8080/api/v1/listings');
        expect(searchResponse.status()).toBe(200);
        const allListings = await searchResponse.json();
        const found = allListings.find((l: any) => l.id === createdListing.id);
        expect(found).toBeDefined();
    });
});
