const axios = require('axios');

async function testStats() {
    try {
        console.log("Testing HOD Stats for 'Artificial intelligence and data science'...");
        // Replace with your actual backend URL if different
        const response = await axios.get('http://localhost:3000/api/admin/hod-stats/Artificial intelligence and data science', {
            // Mock headers if middleware checks for token
            // headers: { 'x-auth-token': 'YOUR_TOKEN' }
        });

        // Note: Without a valid token, this will likely fail with 401. 
        // We're just checking if the route is reachable or if we can infer anything.
        // To properly test, we'd need to mock the auth middleware or get a token.
        // Since I cannot easily get a token here, I will rely on the console logs I added to the server.
        console.log(response.data);
    } catch (error) {
        if (error.response) {
            console.log(`Error Status: ${error.response.status}`);
            console.log(`Error Data:`, error.response.data);
        } else {
            console.log(error.message);
        }
    }
}

testStats();
