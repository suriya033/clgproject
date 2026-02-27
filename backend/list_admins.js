const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const listUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const users = await User.find({ userId: 'admin' });
        console.log('Admin users count:', users.length);
        users.forEach(u => {
            console.log('ID:', u._id, 'userId:', u.userId, 'role:', u.role, 'passHash:', u.password);
        });
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
};

listUsers();
