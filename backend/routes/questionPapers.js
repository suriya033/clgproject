const express = require('express');
const router = express.Router();
const QuestionPaper = require('../models/QuestionPaper');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Multer Config
const storage = multer.diskStorage({
    destination: './uploads/question-papers/',
    filename: function (req, file, cb) {
        cb(null, 'QP-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10000000 }, // 10MB
}).single('file');

// @route   POST api/question-papers
// @desc    Upload a new question paper
// @access  Library/Admin
router.post('/', auth(['Library', 'Admin']), (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ message: 'File upload failed' });
        }
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload a file' });
        }

        const { title, subject, department, year, semester, examType, examYear } = req.body;

        try {
            const newQP = new QuestionPaper({
                title,
                subject,
                department,
                year,
                semester,
                examType,
                examYear,
                fileUrl: `/uploads/question-papers/${req.file.filename}`,
                uploadedBy: req.user.id
            });

            await newQP.save();
            res.json(newQP);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    });
});

// @route   GET api/question-papers
// @desc    Get all question papers
// @access  Private
router.get('/', auth(), async (req, res) => {
    try {
        const qps = await QuestionPaper.find().sort({ createdAt: -1 });
        res.json(qps);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
