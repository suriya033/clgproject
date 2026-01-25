const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const checkAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const admin = await User.findOne({ userId: 'admin' });
        if (admin) {
            console.log('Admin user found:');
            console.log('ID:', admin.userId);
            console.log('Role:', admin.role);
            console.log('Name:', admin.name);
        } else {
            console.log('Admin user NOT found in database.');
        }
        process.exit();
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
};

checkAdmin();
