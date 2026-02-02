const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Department = require('../models/Department');
const Course = require('../models/Course');
const Announcement = require('../models/Announcement');
const Fee = require('../models/Fee');
const Bus = require('../models/Bus');
const User = require('../models/User');
const LibraryItem = require('../models/LibraryItem');
const Subject = require('../models/Subject');
const multer = require('multer');
const path = require('path');

// Multer Config for Announcements
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/announcements/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

// --- Department Routes ---
router.post('/departments', auth(['Admin', 'Office']), async (req, res) => {
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


router.delete('/departments/:id', auth(['Admin', 'Office']), async (req, res) => {
    try {
        await Department.findByIdAndDelete(req.params.id);
        res.json({ message: 'Department deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.put('/departments/:id', auth(['Admin', 'Office']), async (req, res) => {
    try {
        const { hod: newHodId } = req.body;
        const oldDept = await Department.findById(req.params.id);

        // If HOD is being updated
        if (newHodId && oldDept.hod && oldDept.hod.toString() !== newHodId) {
            // Revert old HOD to Staff
            await User.findByIdAndUpdate(oldDept.hod, { role: 'Staff' });
        }

        const dept = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('hod', 'name');

        // Promote new HOD
        if (newHodId) {
            await User.findByIdAndUpdate(newHodId, {
                role: 'HOD',
                department: dept.name
            });
        }

        res.json(dept);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


// --- Course Routes ---
router.post('/courses', auth(['Admin', 'Office']), async (req, res) => {
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

router.delete('/courses/:id', auth(['Admin', 'Office']), async (req, res) => {
    try {
        await Course.findByIdAndDelete(req.params.id);
        res.json({ message: 'Course deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.put('/courses/:id', auth(['Admin', 'Office']), async (req, res) => {
    try {
        const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(course);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- Subject Routes ---
router.post('/subjects', auth(['Admin', 'Office']), async (req, res) => {
    try {
        const subject = new Subject(req.body);
        await subject.save();
        res.json(subject);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/subjects', auth(), async (req, res) => {
    try {
        const subjects = await Subject.find().populate('department', 'name');
        res.json(subjects);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.delete('/subjects/:id', auth(['Admin', 'Office']), async (req, res) => {
    try {
        await Subject.findByIdAndDelete(req.params.id);
        res.json({ message: 'Subject deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.put('/subjects/:id', auth(['Admin', 'Office']), async (req, res) => {
    try {
        const subject = await Subject.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(subject);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- Announcement Routes ---
router.post('/announcements', auth(['Admin', 'HOD', 'Office']), upload.single('attachment'), async (req, res) => {
    try {
        const { title, content, targetRoles } = req.body;

        let roles = targetRoles;
        if (typeof targetRoles === 'string') {
            roles = JSON.parse(targetRoles);
        }

        const announcementData = {
            title,
            content,
            targetRoles: roles,
            createdBy: req.user.id,
            department: req.user.role === 'HOD' ? req.user.department : (req.body.department || 'All')
        };

        if (req.file) {
            announcementData.attachmentUrl = `${req.protocol}://${req.get('host')}/uploads/announcements/${req.file.filename}`;

            const ext = path.extname(req.file.originalname).toLowerCase();
            if (['.jpg', '.jpeg', '.png', '.gif'].includes(ext)) {
                announcementData.attachmentType = 'image';
            } else if (ext === '.pdf') {
                announcementData.attachmentType = 'pdf';
            } else if (['.doc', '.docx'].includes(ext)) {
                announcementData.attachmentType = 'document';
            } else {
                announcementData.attachmentType = 'other';
            }
        }

        const announcement = new Announcement(announcementData);
        await announcement.save();
        res.json(announcement);
    } catch (err) {
        console.error('Announcement Error:', err);
        res.status(500).json({ message: err.message });
    }
});

router.put('/announcements/:id', auth(['Admin', 'HOD', 'Office']), upload.single('attachment'), async (req, res) => {
    try {
        const { title, content, targetRoles } = req.body;
        let updateData = { title, content };

        if (targetRoles) {
            let roles = targetRoles;
            if (typeof targetRoles === 'string') {
                roles = JSON.parse(targetRoles);
            }
            updateData.targetRoles = roles;
        }

        if (req.file) {
            updateData.attachmentUrl = `${req.protocol}://${req.get('host')}/uploads/announcements/${req.file.filename}`;
            const ext = path.extname(req.file.originalname).toLowerCase();
            if (['.jpg', '.jpeg', '.png', '.gif'].includes(ext)) {
                updateData.attachmentType = 'image';
            } else if (ext === '.pdf') {
                updateData.attachmentType = 'pdf';
            } else if (['.doc', '.docx'].includes(ext)) {
                updateData.attachmentType = 'document';
            } else {
                updateData.attachmentType = 'other';
            }
        }

        const announcement = await Announcement.findByIdAndUpdate(req.params.id, updateData, { new: true });
        res.json(announcement);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/announcements', auth(), async (req, res) => {
    try {
        let query = {};

        // Admin, Office, and HOD can see all announcements for management
        // Admin, Office, and HOD can see all announcements for management
        if (!['Admin', 'Office', 'HOD'].includes(req.user.role)) {
            query = {
                targetRoles: { $in: ['All', req.user.role] },
                $or: [
                    { department: 'All' },
                    { department: req.user.department }
                ]
            };
        }

        const announcements = await Announcement.find(query)
            .sort({ createdAt: -1 })
            .populate('createdBy', 'name');
        res.json(announcements);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.delete('/announcements/:id', auth(['Admin', 'HOD', 'Office']), async (req, res) => {
    try {
        const announcement = await Announcement.findById(req.params.id);
        if (!announcement) {
            return res.status(404).json({ message: 'Announcement not found' });
        }

        // Only Admin or the creator can delete
        if (req.user.role !== 'Admin' && announcement.createdBy.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized to delete this announcement' });
        }

        await announcement.deleteOne();
        res.json({ message: 'Announcement deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- Fee Routes ---
router.post('/fees', auth(['Admin', 'Office']), async (req, res) => {
    try {
        const fee = new Fee(req.body);
        await fee.save();
        res.json(fee);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/fees', auth(), async (req, res) => {
    try {
        let query = {};
        if (req.user.role === 'Student') {
            query = { student: req.user.id };
        }
        const fees = await Fee.find(query).populate('student', 'name userId');
        res.json(fees);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.put('/fees/:id', auth(['Admin', 'Office']), async (req, res) => {
    try {
        const fee = await Fee.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(fee);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- Bus Routes ---
router.post('/buses', auth(['Admin', 'Transport', 'Office']), async (req, res) => {
    try {
        const bus = new Bus(req.body);
        await bus.save();
        res.json(bus);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/buses', auth(), async (req, res) => {
    try {
        const buses = await Bus.find().populate('driverId', 'name email mobileNo');
        res.json(buses);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.put('/buses/:id', auth(['Admin', 'Transport', 'Office']), async (req, res) => {
    try {
        const bus = await Bus.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(bus);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.delete('/buses/:id', auth(['Admin', 'Transport', 'Office']), async (req, res) => {
    try {
        await Bus.findByIdAndDelete(req.params.id);
        res.json({ message: 'Bus deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
