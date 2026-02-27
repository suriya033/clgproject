const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const seedAdmin = async () => {
    try {
        console.log('Connecting to database...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Delete existing admin to be sure
        await User.deleteOne({ userId: 'admin' });

        const admin = new User({
            userId: 'admin',
            password: 'admin123',
            name: 'Administrator',
            email: 'admin@college.edu',
            role: 'Admin',
            department: 'Administration'
        });

        await admin.save();
        console.log('✅ Admin user reset successfully: admin / admin123');

    } catch (err) {
        console.error('Error seeding admin:', err);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
};

seedAdmin();
