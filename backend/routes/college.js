const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Department = require('../models/Department');
const Course = require('../models/Course');
const Announcement = require('../models/Announcement');

// --- Department Routes ---
router.post('/departments', auth(['Admin']), async (req, res) => {
    try {
        const dept = new Department(req.body);
        await dept.save();
        res.json(dept);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/departments', auth(), async (req, res) => {
    try {
        const depts = await Department.find().populate('hod', 'name');
        res.json(depts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- Course Routes ---
router.post('/courses', auth(['Admin']), async (req, res) => {
    try {
        const course = new Course(req.body);
        await course.save();
        res.json(course);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/courses', auth(), async (req, res) => {
    try {
        const courses = await Course.find().populate('department', 'name');
        res.json(courses);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- Announcement Routes ---
router.post('/announcements', auth(['Admin', 'HOD']), async (req, res) => {
    try {
        const announcement = new Announcement({
            ...req.body,
            createdBy: req.user.id
        });
        await announcement.save();
        res.json(announcement);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/announcements', auth(), async (req, res) => {
    try {
        const announcements = await Announcement.find()
            .sort({ createdAt: -1 })
            .populate('createdBy', 'name');
        res.json(announcements);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
