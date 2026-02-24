const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const checkStaff = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const staffRoles = ['Staff', 'HOD', 'Transport', 'Library', 'Hostel', 'Placement', 'Sports', 'Office', 'ExamCell'];
        const users = await User.find({ role: { $in: staffRoles } });

        console.log(`Total Staff found: ${users.length}`);

        const breakdown = {};
        users.forEach(u => {
            breakdown[u.role] = (breakdown[u.role] || 0) + 1;
            console.log(`- ${u.name} (${u.userId}): Role=${u.role}, Dept=${u.department}`);
        });

        console.log('\nBreakdown by role:');
        console.log(JSON.stringify(breakdown, null, 2));

        process.exit();
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
};

checkStaff();
