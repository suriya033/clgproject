const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const connectDB = require('./config/db');

dotenv.config();

connectDB().then(async () => {
    try {
        const admin = await User.findOne({ userId: 'admin' });
        if (admin) {
            console.log('Admin user found:');
            console.log('ID:', admin.userId);
            console.log('Password hash:', admin.password);
            console.log('Role:', admin.role);

            const isMatch = await admin.comparePassword('admin123');
            console.log('Password "admin123" matches:', isMatch);
        } else {
            console.log('Admin user not found.');
        }
    } catch (err) {
        console.error('Error:', err);
    } finally {
        mongoose.connection.close();
    }
});
