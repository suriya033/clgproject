require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI).then(async () => {
    const depts = await User.distinct('department');
    console.log('User Departments:', depts);
    mongoose.connection.close();
});
