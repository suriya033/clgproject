const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        console.error('Possible fixes:');
        console.error('1. Check your internet connection.');
        console.error('2. Whitelist your current IP address in MongoDB Atlas.');
        console.error('3. Check if your Mongo URI is correct.');
        process.exit(1);
    }
};

module.exports = connectDB;
