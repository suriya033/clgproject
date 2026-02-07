const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
        });
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ MongoDB Initial Connection Error: ${error.message}`);
        // Instead of exiting, we let Mongoose handle reconnections if it's a transient issue
        // or wait for the next attempt.
    }
};

// Handle connection events
mongoose.connection.on('error', err => {
    console.error(`❌ MongoDB Connection Error: ${err.message}`);
});

mongoose.connection.on('disconnected', () => {
    console.warn('⚠️ MongoDB Disconnected. Attempting to reconnect...');
});

mongoose.connection.on('reconnected', () => {
    console.log('✅ MongoDB Reconnected');
});

module.exports = connectDB;

