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
// @access  Private (Admin only)
router.post('/upload', auth(['Admin', 'Office']), upload.single('photo'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }
    const url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    res.json({ url });
});

// @route   POST api/admin/users
// @desc    Create a new user
// @access  Private (Admin only)
router.post('/users', auth(['Admin', 'Office']), async (req, res) => {
    console.log('Creating user with data:', req.body);
    const { userId, password, name, email, role, department, contact, photo, dob, mobileNo, branch, year } = req.body;

    try {
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
            department,
            contact,
            photo,
            dob,
            mobileNo,
            branch,
            year
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
// @access  Private (Admin only)
router.get('/users', auth(['Admin', 'Office']), async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   PUT api/admin/users/:id
// @desc    Update user
// @access  Private (Admin only)
router.put('/users/:id', auth(['Admin', 'Office']), async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   DELETE api/admin/users/:id
// @desc    Delete user
// @access  Private (Admin only)
router.delete('/users/:id', auth(['Admin', 'Office']), async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'User deleted' });
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

module.exports = router;
