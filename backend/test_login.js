const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const testLogin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const userId = 'admin';
        const password = 'admin123';

        const user = await User.findOne({ userId });
        if (!user) {
            console.log('User not found');
            process.exit();
        }

        const isMatch = await user.comparePassword(password);
        console.log('Password match:', isMatch);

        process.exit();
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
};

testLogin();
