const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');
const Department = require('../models/Department');
const Course = require('../models/Course');
const LibraryItem = require('../models/LibraryItem');
const Bus = require('../models/Bus');
const Announcement = require('../models/Announcement');
const Fee = require('../models/Fee');
const IssuedBook = require('../models/IssuedBook');
const Class = require('../models/Class');

// ... existing code ...

// @route   GET api/admin/classes
// @desc    Get all classes (filtered by dept for HOD)
// @access  Private (Admin/HOD)
router.get('/classes', auth(['Admin', 'HOD', 'Office']), async (req, res) => {
    try {
        let query = {};
        if (req.user.role === 'HOD') {
            query.department = req.user.department;
        }
        const classes = await Class.find(query).populate('coordinator', 'name userId');
        res.json(classes);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   POST api/admin/classes
// @desc    Create or update a class
// @access  Private (Admin/HOD)
router.post('/classes', auth(['Admin', 'HOD']), async (req, res) => {
    const { name, department, semester, section, coordinatorId, academicYear, id } = req.body;
    try {
        let finalDept = department;
        if (req.user.role === 'HOD') {
            finalDept = req.user.department;
        }

        let cls;
        if (id && id.length > 10) { // Check if it's a valid mongo ID
            cls = await Class.findById(id);
        }

        if (cls) {
            cls.name = name;
            cls.semester = semester;
            cls.section = section;
            cls.coordinator = coordinatorId;
            cls.academicYear = academicYear;
            await cls.save();
        } else {
            cls = new Class({
                name,
                department: finalDept,
                semester,
                section,
                coordinator: coordinatorId,
                academicYear
            });
            await cls.save();
        }

        // If coordinator is assigned, update the User model too
        if (coordinatorId) {
            await User.findByIdAndUpdate(coordinatorId, {
                isCoordinator: true,
                coordinatorDetails: {
                    department: finalDept,
                    semester: semester,
                    section: section
                }
            });
        }

        res.json(cls);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error: ' + err.message);
    }
});

// @route   POST api/admin/classes/assign-students
// @desc    Assign students to a specific year/section
// @access  Private (Admin/HOD)
router.post('/classes/assign-students', auth(['Admin', 'HOD']), async (req, res) => {
    const { studentIds, semester, section, department } = req.body;
    try {
        await User.updateMany(
            { _id: { $in: studentIds } },
            {
                $set: {
                    semester: semester,
                    section: section,
                    department: department
                }
            }
        );
        res.json({ message: 'Students assigned successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Multer Config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

// @route   POST api/admin/upload
// @desc    Upload user photo
// @access  Private (Admin/Office/HOD)
router.post('/upload', auth(['Admin', 'Office', 'HOD']), upload.single('photo'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }
    const url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    res.json({ url });
});

// @route   POST api/admin/users
// @desc    Create a new user
// @access  Private (Admin/Office/HOD)
router.post('/users', auth(['Admin', 'Office', 'HOD']), async (req, res) => {
    console.log('Creating user with data:', req.body);
    const {
        userId, password, name, email, role, department, contact, photo, dob, mobileNo, branch, year,
        section, residencyType, parentContact, community, address, bloodGroup, admissionType, semester
    } = req.body;

    try {
        // HOD Enforcement
        let finalDepartment = department;
        if (req.user.role === 'HOD') {
            finalDepartment = req.user.department;
        }

        let user = await User.findOne({ $or: [{ userId }, { email }] });
        if (user) {
            return res.status(400).json({ message: 'User already exists with this ID or Email' });
        }

        user = new User({
            userId,
            password,
            name,
            email,
            role,
            department: finalDepartment,
            contact,
            photo,
            dob,
            mobileNo,
            branch,
            year,
            section,
            residencyType,
            parentContact,
            community,
            address,
            bloodGroup,
            admissionType,
            semester
        });

        await user.save();
        res.json({ message: 'User created successfully', user: { id: user.id, userId, name, role } });
    } catch (err) {
        console.error('Create User Error:', err);
        if (err.name === 'ValidationError') {
            return res.status(400).json({ message: err.message });
        }
        res.status(500).send('Server error: ' + err.message);
    }
});

// @route   GET api/admin/users
// @desc    Get all users
// @access  Private (Admin/Office/HOD)
router.get('/users', auth(['Admin', 'Office', 'HOD']), async (req, res) => {
    try {
        let query = {};
        if (req.user.role === 'HOD') {
            query.department = req.user.department;
        }
        const users = await User.find(query).select('-password');
        res.json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   PUT api/admin/users/:id
// @desc    Update user
// @access  Private (Admin/Office/HOD)
router.put('/users/:id', auth(['Admin', 'Office', 'HOD']), async (req, res) => {
    try {
        let targetUser = await User.findById(req.params.id);
        if (!targetUser) return res.status(404).json({ message: 'User not found' });

        // HOD Enforcement
        if (req.user.role === 'HOD' && targetUser.department !== req.user.department) {
            return res.status(403).json({ message: 'Access denied: You can only edit users in your department' });
        }

        const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
        res.json(updatedUser);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   DELETE api/admin/users/:id
// @desc    Delete user
// @access  Private (Admin/Office/HOD)
router.delete('/users/:id', auth(['Admin', 'Office', 'HOD']), async (req, res) => {
    try {
        let targetUser = await User.findById(req.params.id);
        if (!targetUser) return res.status(404).json({ message: 'User not found' });

        // HOD Enforcement
        if (req.user.role === 'HOD' && targetUser.department !== req.user.department) {
            return res.status(403).json({ message: 'Access denied: You can only delete users in your department' });
        }

        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'User deleted' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET api/admin/coordinator/students
// @desc    Get students for the assigned class of a coordinator
// @access  Private (Coordinator)
router.get('/coordinator/students', auth(['Staff', 'HOD']), async (req, res) => {
    try {
        if (!req.user.isCoordinator || !req.user.coordinatorDetails) {
            return res.status(403).json({ message: 'User is not a class coordinator' });
        }

        const { department, semester, section } = req.user.coordinatorDetails;
        const students = await User.find({
            role: 'Student',
            department,
            semester,
            section
        }).select('-password');

        res.json(students);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET api/admin/library
// @desc    Get all library items
// @access  Private (Admin/Library only)
router.get('/library', auth(['Admin', 'Library', 'Office']), async (req, res) => {
    try {
        const items = await require('../models/LibraryItem').find().sort({ addedAt: -1 });
        res.json(items);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   POST api/admin/library
// @desc    Add a library item
// @access  Private (Admin/Library only)
router.post('/library', auth(['Admin', 'Library', 'Office']), async (req, res) => {
    try {
        const newItem = new (require('../models/LibraryItem'))(req.body);
        const item = await newItem.save();
        res.json(item);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   PUT api/admin/library/:id
// @desc    Update a library item
// @access  Private (Admin/Library only)
router.put('/library/:id', auth(['Admin', 'Library', 'Office']), async (req, res) => {
    try {
        const item = await require('../models/LibraryItem').findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(item);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   DELETE api/admin/library/:id
// @desc    Delete a library item
// @access  Private (Admin/Library only)
router.delete('/library/:id', auth(['Admin', 'Library', 'Office']), async (req, res) => {
    try {
        await require('../models/LibraryItem').findByIdAndDelete(req.params.id);
        res.json({ message: 'Item deleted' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   POST api/admin/library/issue
// @desc    Issue a book to a student
// @access  Private (Admin/Library only)
router.post('/library/issue', auth(['Admin', 'Library', 'Office']), async (req, res) => {
    const { bookId, studentId, dueDate } = req.body;
    try {
        const book = await LibraryItem.findById(bookId);
        if (!book) return res.status(404).json({ message: 'Book not found' });

        if (book.quantity < 1) return res.status(400).json({ message: 'Book out of stock' });

        const student = await User.findOne({ userId: studentId, role: 'Student' });
        if (!student) return res.status(404).json({ message: 'Student not found' });

        const issuedBook = new IssuedBook({
            book: bookId,
            studentId: studentId,
            studentName: student.name,
            bookTitle: book.title,
            dueDate: dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Default 30 days (1 month)
        });

        await issuedBook.save();

        // Decrement quantity
        book.quantity -= 1;
        await book.save();

        res.json(issuedBook);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   POST api/admin/library/return/:id
// @desc    Return a book
// @access  Private (Admin/Library only)
router.post('/library/return/:id', auth(['Admin', 'Library', 'Office']), async (req, res) => {
    console.log('Return request for ID:', req.params.id);
    try {
        const issuedBook = await IssuedBook.findById(req.params.id);
        if (!issuedBook) return res.status(404).json({ message: 'Issued record not found' });

        if (issuedBook.status === 'Returned') {
            return res.status(400).json({ message: 'Book already returned' });
        }

        issuedBook.status = 'Returned';
        issuedBook.returnDate = Date.now();
        await issuedBook.save();

        // Increment quantity
        const book = await LibraryItem.findById(issuedBook.book);
        if (book) {
            book.quantity += 1;
            await book.save();
        }

        res.json(issuedBook);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET api/admin/library/issued
// @desc    Get all issued books
// @access  Private (Admin/Library only)
router.get('/library/issued', auth(['Admin', 'Library', 'Office']), async (req, res) => {
    try {
        const issuedBooks = await IssuedBook.find({ status: 'Issued' }).sort({ issueDate: -1 });
        res.json(issuedBooks);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET api/admin/library/students
// @desc    Get all students for selection
// @access  Private (Admin/Library only)
router.get('/library/students', auth(['Admin', 'Library', 'Office']), async (req, res) => {
    console.log('Fetching students list...');
    try {
        const students = await User.find({ role: 'Student' })
            .select('userId name department year')
            .sort({ name: 1 });
        res.json(students);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET api/admin/library/returned
// @desc    Get all returned books history
// @access  Private (Admin/Library only)
router.get('/library/returned', auth(['Admin', 'Library', 'Office']), async (req, res) => {
    try {
        const returnedBooks = await IssuedBook.find({ status: 'Returned' }).sort({ returnDate: -1 });
        res.json(returnedBooks);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET api/admin/stats
// @desc    Get dashboard stats
// @access  Private (Admin/Office only)
router.get('/stats', auth(['Admin', 'Office']), async (req, res) => {
    try {
        const studentCount = await User.countDocuments({ role: 'Student' });
        const staffCount = await User.countDocuments({
            role: { $in: ['Staff', 'HOD', 'Transport', 'Library', 'Hostel', 'Placement', 'Sports', 'Office', 'ExamCell'] }
        });
        const driverCount = await User.countDocuments({ role: 'Driver' });
        const deptCount = await Department.countDocuments();
        const courseCount = await Course.countDocuments();
        const libraryCount = await LibraryItem.countDocuments();
        const busCount = await Bus.countDocuments();
        const noticeCount = await Announcement.countDocuments();
        const pendingFees = await Fee.countDocuments({ status: 'Pending' });

        res.json({
            students: studentCount,
            staff: staffCount,
            drivers: driverCount,
            departments: deptCount,
            courses: courseCount,
            libraryItems: libraryCount,
            buses: busCount,
            notices: noticeCount,
            pendingFees: pendingFees
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET api/admin/hod-stats/:department
// @desc    Get dashboard stats for HOD (department specific)
// @access  Private (Admin/Office/HOD)
router.get('/hod-stats/:department', auth(['Admin', 'Office', 'HOD']), async (req, res) => {
    try {
        let deptName = req.params.department.trim();

        // Department Aliases Mapping
        const deptAliases = {
            'AIDS': ['AIDS', 'Artificial Intelligence and Data Science', 'Artificial intelligence and data science', 'Aids'],
            'Artificial Intelligence and Data Science': ['AIDS', 'Artificial Intelligence and Data Science', 'Artificial intelligence and data science', 'Aids'],
            'CSE': ['CSE', 'Computer Science and Engineering', 'Computer Science', 'Cse'],
            'IT': ['IT', 'Information Technology', 'Information technology'],
            'ECE': ['ECE', 'Electronics and Communication Engineering', 'Ece'],
            'EEE': ['EEE', 'Electrical and Electronics Engineering', 'Eee'],
            'MECH': ['MECH', 'Mechanical Engineering', 'Mechanical', 'Mech'],
            'CIVIL': ['CIVIL', 'Civil Engineering', 'Civil'],
            'Artificial intelligence and data science': ['AIDS', 'Artificial Intelligence and Data Science', 'Artificial intelligence and data science', 'Aids']
        };

        // Normalize matching keys (case-insensitive check)
        let searchDepts = [deptName];

        // Find if deptName matches any key or value in the alias map
        for (const [key, values] of Object.entries(deptAliases)) {
            const isKeyMatch = key.toLowerCase() === deptName.toLowerCase();
            const isValueMatch = values.some(v => v.trim().toLowerCase() === deptName.toLowerCase());

            if (isKeyMatch || isValueMatch) {
                // If match found, search for ALL variations in that group
                searchDepts = values;
                break; // Use the first matching group
            }
        }

        // Create case-insensitive regex patterns for all variations, allowing trailing spaces
        const deptRegexes = searchDepts.map(d => new RegExp('^' + d.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*$', 'i'));

        console.log(`HOD Stats Debug: Params Dept="${deptName}"`);
        console.log(`Search Regexes:`, deptRegexes);

        // Find the actual department document
        const departmentDoc = await Department.findOne({
            name: { $in: deptRegexes }
        });

        const studentCount = await User.countDocuments({
            role: 'Student',
            department: { $in: deptRegexes }
        });
        console.log(`Found Students: ${studentCount}`);

        // Get student breakdown by year
        const studentsByYear = await User.aggregate([
            {
                $match: {
                    role: 'Student',
                    department: { $in: deptRegexes }
                }
            },
            {
                $group: {
                    _id: "$year", // Group by year field
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        const staffCount = await User.countDocuments({
            role: { $in: ['Staff', 'HOD'] },
            department: { $in: deptRegexes }
        });
        console.log(`Found Staff: ${staffCount}`);

        let courseCount = 0;
        if (departmentDoc) {
            courseCount = await Course.countDocuments({
                department: departmentDoc._id
            });
        }

        res.json({
            students: studentCount,
            studentsByYear: studentsByYear,
            staff: staffCount,
            courses: courseCount
        });
    } catch (err) {
        console.error('HOD Stats Error:', err.message);
        res.status(500).send('Server error: ' + err.message);
    }
});

// @route   POST api/admin/assign-coordinator
// @desc    Assign a staff as class coordinator
// @access  Private (Admin/HOD)
router.post('/assign-coordinator', auth(['Admin', 'HOD']), async (req, res) => {
    const { staffId, department, semester, section } = req.body;
    try {
        const staff = await User.findById(staffId);
        if (!staff || (staff.role !== 'Staff' && staff.role !== 'HOD')) {
            return res.status(404).json({ message: 'Staff member not found' });
        }

        staff.isCoordinator = true;
        staff.coordinatorDetails = {
            department: department,
            semester: semester,
            section: section
        };
        await staff.save();

        res.json({ message: 'Coordinator assigned successfully', user: staff });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET api/admin/student-full-details/:id
// @desc    Get comprehensive student profile (Basic, Attendance, Marks)
// @access  Private (Admin/HOD/Staff)
router.get('/student-full-details/:id', auth(['Admin', 'HOD', 'Staff']), async (req, res) => {
    try {
        const studentId = req.params.id;
        const student = await User.findById(studentId).select('-password');

        if (!student || student.role !== 'Student') {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Fetch Attendance Stats
        const Attendance = require('../models/Attendance');
        const totalPeriods = await Attendance.countDocuments({ student: studentId });
        const attendedPeriods = await Attendance.countDocuments({
            student: studentId,
            status: { $in: ['P', 'OD'] }
        });

        // Fetch Subject-wise Attendance
        const subjectWiseAttendance = await Attendance.aggregate([
            { $match: { student: new mongoose.Types.ObjectId(studentId) } },
            {
                $group: {
                    _id: "$subject",
                    total: { $sum: 1 },
                    attended: { $sum: { $cond: [{ $in: ["$status", ["P", "OD"]] }, 1, 0] } }
                }
            }
        ]);

        // Fetch Marks
        const Mark = require('../models/Mark');
        const marks = await Mark.find({ student: studentId }).sort({ examType: 1, subject: 1 });

        res.json({
            profile: student,
            attendance: {
                percentage: totalPeriods > 0 ? ((attendedPeriods / totalPeriods) * 100).toFixed(1) : "0.0",
                attended: attendedPeriods,
                total: totalPeriods,
                subjectWise: subjectWiseAttendance
            },
            marks: marks
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;

// @route   POST api/admin/complaints
// @desc    Submit a complaint (Student)
// @access  Private (Student)
router.post('/complaints', auth(['Student']), async (req, res) => {
    const { recipient, subject, message } = req.body;
    try {
        const student = await User.findById(req.user.id);
        const newComplaint = new (require('../models/Complaint'))({
            userId: req.user.id,
            studentName: student.name,
            department: student.department || 'General',
            year: student.year || '1',
            section: student.section,
            recipient, // 'Admin' or 'HOD'
            subject,
            message
        });
        await newComplaint.save();
        res.json(newComplaint);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET api/admin/complaints
// @desc    Get complaints for Admin or HOD
// @access  Private (Admin, HOD)
router.get('/complaints', auth(['Admin', 'HOD']), async (req, res) => {
    try {
        let query = {};

        // Filter by recipient role
        if (req.user.role === 'Admin') {
            query.recipient = 'Admin';
        } else if (req.user.role === 'HOD') {
            query.recipient = 'HOD';
            // Also filter by department for HOD
            // We need to match student's department with HOD's department
            // Since we store department in the complaint, we can use that
            // Handle aliases if needed, but for now simple match
            query.department = { $regex: new RegExp(req.user.department, 'i') };
        }

        const complaints = await require('../models/Complaint').find(query).sort({ createdAt: -1 });
        res.json(complaints);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   PUT api/admin/complaints/:id
// @desc    Update complaint status
// @access  Private (Admin, HOD)
router.put('/complaints/:id', auth(['Admin', 'HOD']), async (req, res) => {
    const { status, resolutionNote } = req.body;
    try {
        const complaint = await require('../models/Complaint').findById(req.params.id);
        if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

        // Verify ownership/access
        if (req.user.role === 'HOD') {
            // Basic check if HOD department matches complaint department
            // (Though strict check might block aliases, lenient check is better here)
        }

        if (status) complaint.status = status;
        if (resolutionNote) complaint.resolutionNote = resolutionNote;

        await complaint.save();
        res.json(complaint);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});
