const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const testCreateUser = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const userData = {
            userId: 'testStaff123',
            password: 'password123',
            name: 'Test Staff',
            email: 'test@staff.com',
            role: 'Staff',
            department: 'CS', // Let's assume this exists
            mobileNo: '1234567890'
        };

        const user = new User(userData);
        await user.validate();
        console.log('Validation successful!');

        process.exit();
    } catch (err) {
        console.error('Validation failed:', err.message);
        process.exit(1);
    }
};

testCreateUser();
