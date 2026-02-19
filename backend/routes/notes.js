const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Note = require('../models/Note');
const multer = require('multer');
const path = require('path');

// Multer Config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/notes/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const filetypes = /pdf|doc|docx|jpg|jpeg|png/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb('Error: Only Documents & Images Allowed!');
        }
    }
});

// @route   POST api/notes/upload
// @desc    Upload academic notes
// @access  Private (Staff/HOD/Admin)
router.post('/upload', auth(['Staff', 'HOD', 'Admin']), upload.single('noteFile'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const { title, subject, department, year, semester } = req.body;

        const fileUrl = `${req.protocol}://${req.get('host')}/uploads/notes/${req.file.filename}`;

        const newNote = new Note({
            title,
            subject,
            department,
            year,
            semester,
            fileUrl,
            fileName: req.file.originalname,
            fileType: req.file.mimetype.split('/')[1] === 'pdf' ? 'pdf' : 'other',
            uploadedBy: req.user.id
        });

        await newNote.save();
        res.json(newNote);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/notes/fetch
// @desc    Get notes with filters
// @access  Private
router.get('/fetch', auth(), async (req, res) => {
    try {
        const { department, year, semester, subject } = req.query;
        let query = {};

        if (department) query.department = department;
        if (year) query.year = year;
        if (semester) query.semester = semester;
        if (subject) query.subject = { $regex: subject, $options: 'i' };

        const notes = await Note.find(query)
            .populate('uploadedBy', 'name')
            .sort({ createdAt: -1 });

        res.json(notes);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/notes/:id
// @access  Private (Owner/Admin)
router.delete('/:id', auth(['Staff', 'HOD', 'Admin']), async (req, res) => {
    try {
        const note = await Note.findById(req.params.id);
        if (!note) return res.status(404).json({ message: 'Note not found' });

        // Check ownership
        if (note.uploadedBy.toString() !== req.user.id && req.user.role !== 'Admin') {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await Note.findByIdAndDelete(req.params.id);
        res.json({ message: 'Note deleted' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
