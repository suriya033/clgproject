const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Department = require('./models/Department');

dotenv.config();

const checkDepts = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const depts = await Department.find();
        console.log(JSON.stringify(depts.map(d => ({
            name: d.name,
            id: d._id
        })), null, 2));
        process.exit();
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
};

checkDepts();
