const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const seedAdmin = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected successfully.');

        console.log('Checking for existing Admin...');
        const adminExists = await User.findOne({ role: 'Admin' });
        if (adminExists) {
            console.log('Admin already exists. Skipping seed.');
            process.exit();
        }

        console.log('Creating new Admin user...');
        const admin = new User({
            userId: 'admin',
            password: 'admin123',
            name: 'System Administrator',
            email: 'admin@college.edu',
            role: 'Admin',
            department: 'Administration'
        });

        await admin.save();
        console.log('Initial Admin user created successfully!');
        console.log('Credentials: admin / admin123');
        process.exit();
    } catch (err) {
        console.error('SEED ERROR:', err.message);
        if (err.errors) {
            Object.keys(err.errors).forEach(key => {
                console.error(`Field ${key}: ${err.errors[key].message}`);
            });
        }
        process.exit(1);
    }
};

seedAdmin();
