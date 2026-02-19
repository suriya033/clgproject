const mongoose = require('mongoose');
const dotenv = require('dotenv');
const TimeTable = require('./models/TimeTable');

dotenv.config();

const testQuery = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const all = await TimeTable.find().limit(1);
        if (all.length === 0) {
            console.log('No timetables in DB');
            process.exit();
        }

        const first = all[0];
        console.log('Testing with existing record:');
        console.log('ID:', first.department);
        console.log('Sem:', first.semester);
        console.log('Sec:', first.section);

        // Exact match with strings
        const found = await TimeTable.findOne({
            department: first.department.toString(),
            semester: first.semester,
            section: first.section
        });

        console.log('Found with strings:', !!found);

        process.exit();
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
};

testQuery();
