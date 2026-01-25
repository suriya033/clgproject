const testUrl = async (url) => {
    try {
        console.log(`Testing ${url}...`);
        const res = await fetch(url);
        console.log(`${url} SUCCESS:`, res.status);
    } catch (e) {
        console.log(`${url} FAILED:`, e.message);
    }
};

const run = async () => {
    await testUrl('https://www.google.com');
    await testUrl('http://localhost:5001');
    await testUrl('http://10.18.126.226:5001');
};

run();
