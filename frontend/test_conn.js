const axios = require('axios');

const testUrl = async (url) => {
    try {
        console.log(`Testing ${url}...`);
        const res = await axios.get(url, { timeout: 5001 });
        console.log(`${url} SUCCESS:`, res.status);
    } catch (e) {
        console.log(`${url} FAILED:`, e.message);
    }
};

const run = async () => {
    await testUrl('https://www.google.com');
    await testUrl('http://localhost:5002');
    await testUrl('http://10.18.126.88:5002');
};

run();
