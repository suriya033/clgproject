const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

connectDB().then(async () => {
    try {
        const students = await User.find({ role: 'Student' });
        console.log(`Found ${students.length} students.`);
        if (students.length > 0) {
            console.log('Sample:', students[0]);
        } else {
            console.log('No students found with role "Student".');
        }
    } catch (err) {
        console.error(err);
    } finally {
        mongoose.connection.close();
    }
});
