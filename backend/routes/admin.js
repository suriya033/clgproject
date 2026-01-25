const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');

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
router.post('/upload', auth(['Admin']), upload.single('photo'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }
    const url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    res.json({ url });
});

// @route   POST api/admin/users
// @desc    Create a new user
// @access  Private (Admin only)
router.post('/users', auth(['Admin']), async (req, res) => {
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
router.get('/users', auth(['Admin']), async (req, res) => {
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
router.put('/users/:id', auth(['Admin']), async (req, res) => {
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
router.delete('/users/:id', auth(['Admin']), async (req, res) => {
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
// @access  Private (Admin only)
router.get('/library', auth(['Admin']), async (req, res) => {
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
// @access  Private (Admin only)
router.post('/library', auth(['Admin']), async (req, res) => {
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
// @access  Private (Admin only)
router.delete('/library/:id', auth(['Admin']), async (req, res) => {
    try {
        await require('../models/LibraryItem').findByIdAndDelete(req.params.id);
        res.json({ message: 'Item deleted' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
