const axios = require('axios');

async function testFetchStudents() {
    try {
        // Login first to get token
        const loginRes = await axios.post('http://localhost:5002/api/auth/login', {
            userId: 'admin',
            password: 'admin123'
        });

        const token = loginRes.data.token;
        console.log('Login successful, token obtained.');

        // Fetch students
        const res = await axios.get('http://localhost:5002/api/admin/library/students', {
            headers: { 'x-auth-token': token }
        });

        console.log('Status:', res.status);
        console.log('Data count:', res.data.length);
        console.log('First 3 students:', res.data.slice(0, 3));
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
    }
}

testFetchStudents();
