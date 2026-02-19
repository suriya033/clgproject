const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Department = require('./models/Department');

dotenv.config();

const checkDuplicateDepts = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const depts = await Department.find();
        for (const d of depts) {
            process.stdout.write(`NAME_START|${d.name}|NAME_END ID:${d._id}\n`);
        }
        process.exit();
    } catch (err) {
        process.exit(1);
    }
};

checkDuplicateDepts();
