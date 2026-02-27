const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const checkAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const admin = await User.findOne({ userId: 'admin' });
        if (admin) {
            console.log('Admin found:', admin.userId);
            const isMatch = await admin.comparePassword('admin123');
            console.log('Password "admin123" match:', isMatch);
        } else {
            console.log('Admin NOT found');
        }
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
};

checkAdmin();
