const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const testStats = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const staffCount = await User.countDocuments({
            role: { $in: ['Staff', 'HOD'] }
        });
        const otherStaffCount = await User.countDocuments({
            role: { $in: ['Transport', 'Library', 'Hostel', 'Placement', 'Sports', 'Office', 'ExamCell'] }
        });

        console.log('--- TEST RESULTS ---');
        console.log(`Staff Count (New Logic): ${staffCount}`);
        console.log(`Other Staff Count: ${otherStaffCount}`);

        if (staffCount === 0) {
            console.log('SUCCESS: Staff count is now 0 as expected by user.');
        } else {
            console.log('WARNING: Staff count is still > 0. Roles present:');
            const users = await User.find({ role: { $in: ['Staff', 'HOD'] } });
            users.forEach(u => console.log(`- ${u.name} (${u.role})`));
        }

        process.exit();
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
};

testStats();
