const mongoose = require('mongoose');
const User = require('./models/User'); // Path to your User model
const dotenv = require('dotenv');

dotenv.config();

const MONGO_URI = 'mongodb+srv://suriya003:admin@cluster0.jb7yduw.mongodb.net/?appName=Cluster0';

async function seedAdmin() {
    try {
        console.log('⏳ Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB.');

        // Find existing admin or start fresh
        let admin = await User.findOne({ userId: 'admin' });

        if (admin) {
            console.log('ℹ️ Admin user exists. Resetting password to "admin123"...');
            admin.password = 'admin123';
            await admin.save();
            console.log('✅ Admin password updated!');
        } else {
            console.log('ℹ️ Admin user not found. Creating new admin...');
            admin = new User({
                userId: 'admin',
                password: 'admin123',
                name: 'Administrator',
                email: 'admin@college.edu',
                role: 'Admin',
                department: 'Administration'
            });
            await admin.save();
            console.log('✅ Initial Admin user created successfully!');
        }

        process.exit(0);
    } catch (err) {
        console.error('❌ Error seeding admin:', err.message);
        process.exit(1);
    }
}

seedAdmin();
