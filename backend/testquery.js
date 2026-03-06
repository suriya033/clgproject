require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI).then(async () => {
    console.log('Connected');
    const students = await User.find({ role: 'Student' }).limit(5).select('name department semester section');
    console.log('Sample Students:', students);
    mongoose.connection.close();
});
