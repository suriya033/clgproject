console.log('Starting server.js execution...');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

const connectDB = require('./config/db');
const User = require('./models/User');

dotenv.config();

// Connect to Database
connectDB().then(async () => {
    console.log('Database connected successfully');
    // Auto-seed Admin
    try {
        const adminExists = await User.findOne({ userId: 'admin' });
        if (!adminExists) {
            const admin = new User({
                userId: 'admin',
                password: 'admin123',
                name: 'System Administrator',
                email: 'admin@college.edu',
                role: 'Admin',
                department: 'Administration'
            });
            await admin.save();
            console.log('✅ Initial Admin user created: admin / admin123');
        } else {
            console.log('ℹ️ Admin user already exists in database');
        }
    } catch (err) {
        console.error('❌ Auto-seed error:', err.message);
    }
});

const app = express();

// Middleware
const path = require('path');
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'x-auth-token']
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Basic Route
app.get('/', (req, res) => {
    res.send('College Management API is running...');
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/college', require('./routes/college'));

const PORT = process.env.PORT || 5002;
const HOST = '0.0.0.0';

console.log(`Attempting to start server on ${HOST}:${PORT}...`);

const server = app.listen(PORT, HOST, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`   - Local:   http://localhost:${PORT}`);
    console.log(`   - Network: http://10.18.126.88:${PORT}`);
});

server.on('error', (e) => {
    console.error('❌ Server Error:', e);
    if (e.code === 'EADDRINUSE') {
        console.log(`Port ${PORT} is already in use. Please free the port and try again.`);
        process.exit(1);
    }
});

server.on('listening', () => {
    console.log('✅ Server is now accepting connections');
});
