// Test all API endpoints
const API_BASE = 'https://bible-project-api.onrender.com';

const endpoints = [
    { name: 'Root', url: '/', method: 'GET' },
    { name: 'Health', url: '/api/health', method: 'GET' },
    { name: 'Settings (All)', url: '/api/settings', method: 'GET' },
    { name: 'Logo Settings', url: '/api/settings/logoSettings', method: 'GET' },
    { name: 'Hero Settings', url: '/api/settings/heroSection', method: 'GET' },
    { name: 'Blog Posts', url: '/api/blog', method: 'GET' },
    { name: 'Bible Verses', url: '/api/bible-verses', method: 'GET' },
];

async function testEndpoints() {
    console.log('Testing Bible Project API Endpoints...\n');

    for (const endpoint of endpoints) {
        try {
            const response = await fetch(`${API_BASE}${endpoint.url}`, {
                method: endpoint.method
            });

            const status = response.status;
            const statusText = response.ok ? '✅ OK' : '❌ FAIL';

            console.log(`${statusText} [${status}] ${endpoint.name}: ${API_BASE}${endpoint.url}`);

            if (!response.ok) {
                const text = await response.text();
                console.log(`   Error: ${text.substring(0, 100)}`);
            }
        } catch (error) {
            console.log(`❌ ERROR ${endpoint.name}: ${error.message}`);
        }
    }
}

testEndpoints();
