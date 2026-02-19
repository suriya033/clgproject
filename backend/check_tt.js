const mongoose = require('mongoose');
const dotenv = require('dotenv');
require('./models/Department');
const TimeTable = require('./models/TimeTable');

dotenv.config();

const checkTT = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const tts = await TimeTable.find();
        for (const tt of tts) {
            console.log(`TT -> DeptID: ${tt.department} | Sem: ${tt.semester} | Sec: ${tt.section}`);
        }
        process.exit();
    } catch (err) {
        process.exit(1);
    }
};

checkTT();
