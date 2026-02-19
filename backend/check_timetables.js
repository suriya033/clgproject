const mongoose = require('mongoose');
const dotenv = require('dotenv');
require('./models/Department');
const TimeTable = require('./models/TimeTable');

dotenv.config();

const checkTimetables = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const timetables = await TimeTable.find().populate('department', 'name');

        console.log(JSON.stringify(timetables.map(tt => ({
            deptName: tt.department?.name,
            deptId: tt.department?._id,
            semester: tt.semester,
            section: tt.section
        })), null, 2));

        process.exit();
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
};

checkTimetables();
