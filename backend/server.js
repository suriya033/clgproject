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

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
