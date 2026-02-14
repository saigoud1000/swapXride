
const axios = require('axios');

const API_URL = 'http://localhost:8080/api/v1';

async function testBackend() {
    console.log('Testing Backend Connectivity...');

    // 1. Test Public Endpoint /listings (Mobile Check)
    try {
        const listingsRes = await axios.get(`${API_URL}/listings`);
        console.log(`[PASS] GET /listings: ${listingsRes.status} OK (Count: ${listingsRes.data.length})`);
    } catch (error) {
        console.error(`[FAIL] GET /listings: ${error.message}`);
        if (error.response) console.error(error.response.data);
    }

    // 2. Login to get Token
    let token = '';
    try {
        const loginRes = await axios.post(`${API_URL}/auth/authenticate`, {
            email: 'saigoud1000@gmail.com', // TEST DATA: Using the user from logs
            password: 'password' // Assuming standard password, if fail we might need to register a new user
        });
        token = loginRes.data.token;
        console.log(`[PASS] Login: ${loginRes.status} OK`);
    } catch (error) {
        console.error(`[FAIL] Login: ${error.message} (Trying registration...)`);

        // Try registering a temp user if login fails
        try {
            const regRes = await axios.post(`${API_URL}/auth/register`, {
                firstname: 'Test',
                lastname: 'User',
                email: `test${Date.now()}@example.com`,
                password: 'password'
            });
            token = regRes.data.token;
            console.log(`[PASS] Registration: ${regRes.status} OK`);
        } catch (regError) {
            console.error(`[FAIL] Registration: ${regError.message}`);
            return;
        }
    }

    if (!token) return;

    // 3. Test Protected Endpoint /listings/my (Web Check)
    try {
        const myRes = await axios.get(`${API_URL}/listings/my`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`[PASS] GET /listings/my: ${myRes.status} OK`);
    } catch (error) {
        console.error(`[FAIL] GET /listings/my: ${error.message}`);
        if (error.response) console.error(error.response.data);
    }
}

testBackend();
