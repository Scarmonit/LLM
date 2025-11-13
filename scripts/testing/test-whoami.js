// Test /whoami endpoint
const PUTER_API_URL = 'http://api.puter.localhost:4100';
const PUTER_BASE_URL = 'http://puter.localhost:4100';

async function test() {
    // Login first
    const loginRes = await fetch(`${PUTER_API_URL}/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Origin': PUTER_BASE_URL
        },
        body: JSON.stringify({ username: 'admin', password: 'c849dc06' })
    });

    const loginData = await loginRes.json();
    console.log('Login response:', loginData);

    const token = loginData.token;

    // Test /whoami with token
    const whoamiRes = await fetch(`${PUTER_API_URL}/whoami`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Origin': PUTER_BASE_URL
        }
    });

    console.log('\n/whoami status:', whoamiRes.status);
    const whoamiData = await whoamiRes.json();
    console.log('/whoami response:', whoamiData);
}

test().catch(console.error);
