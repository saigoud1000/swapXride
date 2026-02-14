const { createClient } = require('@supabase/supabase-js');
const fetch = require('node-fetch');

// Supabase Config (from docker-compose.yml)
const SUPABASE_URL = 'https://ocqjktjtoissltwkyvdc.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9jcWprdGp0b2lzc2x0d2t5dmRjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwOTYxNjMsImV4cCI6MjA4MzY3MjE2M30.ym17EorkXq-7s-IP_L7RKyd_D8mP_fVKl03zdYvSCgI';

const API_URL = 'http://localhost:8080/api/v1/listings';

async function runTest() {
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

    try {
        // 1. Create a random test user
        const email = `testuser_${Date.now()}@example.com`;
        const password = 'testpassword123';
        console.log(`Creating test user: ${email}`);

        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
        });

        if (authError) {
            console.error('❌ Auth Error:', authError.message);
            // If sign up fails (e.g. email confirm required), we try to sign in
            // But for a fresh random email, it typically means config prevents it.
            return;
        }

        const token = authData.session?.access_token;
        if (!token) {
            console.log('⚠️ No session returned. Email confirmation might be required.');
            console.log('User ID:', authData.user?.id);
            return;
        }

        console.log('✅ Authenticated! Token acquired.');

        // 2. Prepare Payload (CamelCase)
        const payload = {
            haveYear: 2021,
            haveMake: 'Tesla',
            haveModel: 'Model 3',
            haveTrim: 'Performance',
            bodyType: 'Sedan',
            haveMileage: 5000,
            locationZip: '94103',
            description: 'Test listing from verification script with REAL Supabase Auth',
            condition: 'Excellent',
            titleStatus: 'Clean',
            modifications: 'None',

            wantMake: 'Audi',
            wantModel: 'RS3',
            wantYearMin: 2019,
            cashDirection: 'negotiable',
            wantDescription: 'Looking for a fast sedan',

            photos: []
        };

        // 3. Send Request
        console.log('Sending payload to backend...');
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            const data = await response.json();
            console.log('✅ SUCCESS: Listing created!');
            console.log('Response:', JSON.stringify(data, null, 2));
        } else {
            const text = await response.text();
            console.error('❌ FAILED: ' + response.status + ' ' + response.statusText);
            console.error('Body:', text);
        }

    } catch (error) {
        console.error('❌ ERROR:', error);
    }
}

runTest();
