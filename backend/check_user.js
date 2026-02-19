const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const checkUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const users = await User.find({ role: 'Student' }).limit(5);
        console.log(JSON.stringify(users.map(u => ({
            name: u.name,
            dept: u.department,
            year: u.year,
            sem: u.semester,
            sec: u.section
        })), null, 2));
        process.exit();
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
};

checkUsers();
