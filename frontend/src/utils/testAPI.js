// Quick test to verify API connectivity
// Add this temporarily to your LoginScreen or run in console

import api from '../api/api';

export const testAPIConnection = async () => {
    console.log('🔍 Testing API Connection...');

    try {
        // Test 1: Health check
        console.log('Test 1: Health Check');
        const healthResponse = await api.get('/health');
        console.log('✅ Health check passed:', healthResponse.data);

        // Test 2: Try login with admin credentials
        console.log('Test 2: Login Test');
        const loginResponse = await api.post('/auth/login', {
            userId: 'admin',
            password: 'admin123'
        });
        console.log('✅ Login test passed:', loginResponse.data);

        return { success: true, message: 'All tests passed!' };
    } catch (error) {
        console.error('❌ API Test Failed');

        if (error.code === 'ECONNABORTED') {
            console.error('Timeout: Server took too long to respond');
        } else if (error.request) {
            console.error('Network Error: Cannot reach server');
            console.error('Trying to connect to:', error.config?.baseURL);
        } else if (error.response) {
            console.error('Server Error:', error.response.status, error.response.data);
        } else {
            console.error('Error:', error.message);
        }

        return { success: false, error };
    }
};

// Usage: Call this from your component
// testAPIConnection();
