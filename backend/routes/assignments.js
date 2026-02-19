const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Assignment = require('../models/Assignment');
const Submission = require('../models/AssignmentSubmission');
const multer = require('multer');
const path = require('path');

// Multer Config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dest = req.baseUrl.includes('submit') ? 'uploads/submissions/' : 'uploads/assignments/';
        cb(null, dest);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage });

// @route   POST api/assignments
// @desc    Create an assignment
// @access  Private (Staff/HOD/Admin)
router.post('/', auth(['Staff', 'HOD', 'Admin']), upload.single('attachment'), async (req, res) => {
    try {
        const { title, description, subject, department, year, semester, section, dueDate, totalPoints } = req.body;

        let attachmentUrl = '';
        let attachmentName = '';
        if (req.file) {
            attachmentUrl = `${req.protocol}://${req.get('host')}/uploads/assignments/${req.file.filename}`;
            attachmentName = req.file.originalname;
        }

        const newAssignment = new Assignment({
            title,
            description,
            subject,
            department,
            year,
            semester,
            section,
            dueDate,
            totalPoints,
            attachmentUrl,
            attachmentName,
            createdBy: req.user.id
        });

        await newAssignment.save();
        res.json(newAssignment);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/assignments
// @desc    Get assignments based on role
// @access  Private
router.get('/', auth(), async (req, res) => {
    try {
        let query = {};
        if (req.user.role === 'Student') {
            query = {
                department: req.user.department,
                year: req.user.year,
                section: req.user.section
            };
        } else if (req.user.role === 'Staff') {
            query = { createdBy: req.user.id };
        } else if (req.user.role === 'HOD') {
            query = { department: req.user.department };
        }

        const assignments = await Assignment.find(query)
            .populate('createdBy', 'name')
            .sort({ createdAt: -1 });

        // For students, check if they have submitted
        if (req.user.role === 'Student') {
            const submissions = await Submission.find({ student: req.user.id });
            const submittedIds = submissions.map(s => s.assignment.toString());

            const assignmentsWithStatus = assignments.map(a => {
                const isSubmitted = submittedIds.includes(a._id.toString());
                const sub = submissions.find(s => s.assignment.toString() === a._id.toString());
                return {
                    ...a._doc,
                    isSubmitted,
                    submissionStatus: sub ? sub.status : 'No Submission',
                    grade: sub ? sub.grade : null
                };
            });
            return res.json(assignmentsWithStatus);
        }

        res.json(assignments);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/assignments/:id/submit
// @desc    Submit assignment
// @access  Private (Student)
router.post('/:id/submit', auth(['Student']), upload.single('submissionFile'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload a file' });
        }

        const assignment = await Assignment.findById(req.params.id);
        if (!assignment) return res.status(404).json({ message: 'Assignment not found' });

        // Check if already submitted
        const existing = await Submission.findOne({ assignment: req.params.id, student: req.user.id });
        if (existing) return res.status(400).json({ message: 'Assignment already submitted' });

        const newSubmission = new Submission({
            assignment: req.params.id,
            student: req.user.id,
            fileUrl: `${req.protocol}://${req.get('host')}/uploads/submissions/${req.file.filename}`,
            fileName: req.file.originalname
        });

        await newSubmission.save();
        res.json(newSubmission);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/assignments/:id/submissions
// @desc    Get all submissions for an assignment
// @access  Private (Owner Staff/HOD/Admin)
router.get('/:id/submissions', auth(['Staff', 'HOD', 'Admin']), async (req, res) => {
    try {
        const assignment = await Assignment.findById(req.params.id);
        if (!assignment) return res.status(404).json({ message: 'Assignment not found' });

        const submissions = await Submission.find({ assignment: req.params.id })
            .populate('student', 'name userId department year section')
            .sort({ submittedAt: -1 });

        res.json(submissions);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/assignments/submissions/:subId/grade
// @desc    Grade a submission
// @access  Private (Staff/HOD/Admin)
router.put('/submissions/:subId/grade', auth(['Staff', 'HOD', 'Admin']), async (req, res) => {
    try {
        const { grade, feedback } = req.body;
        const submission = await Submission.findByIdAndUpdate(
            req.params.subId,
            { grade, feedback, status: 'Graded' },
            { new: true }
        );
        res.json(submission);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
