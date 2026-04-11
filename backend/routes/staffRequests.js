const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const StaffLeaveRequest = require('../models/StaffLeaveRequest');
const User = require('../models/User');
const TimeTable = require('../models/TimeTable');
const ClassSubstitution = require('../models/ClassSubstitution');
const Department = require('../models/Department');

// @route   POST api/staff-requests/leave
// @desc    Submit a leave request
// @access  Private (Staff)
router.post('/leave', auth(['Staff', 'HOD']), async (req, res) => {
    try {
        const { leaveType, subject, reason, startDate, endDate, alternateArrangement } = req.body;
        const staff = await User.findById(req.user.id);

        // Find HOD of the department
        const hod = await User.findOne({
            role: 'HOD',
            department: staff.department
        });

        // Find Principal
        const principal = await User.findOne({ role: 'Principal' });

        const newRequest = new StaffLeaveRequest({
            staff: req.user.id,
            hod: hod ? hod._id : null,
            principal: principal ? principal._id : null,
            leaveType,
            subject,
            reason,
            startDate,
            endDate,
            alternateArrangement,
            status: 'Pending_HOD'
        });

        await newRequest.save();
        res.json(newRequest);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET api/staff-requests/my-requests
// @desc    Get staff member's own requests
// @access  Private (Staff)
router.get('/my-requests', auth(['Staff', 'HOD']), async (req, res) => {
    try {
        const requests = await StaffLeaveRequest.find({ staff: req.user.id })
            .populate('hod', 'name')
            .populate('principal', 'name')
            .sort({ appliedAt: -1 });
        res.json(requests);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET api/staff-requests/hod-list
// @desc    Get staff leave requests for HOD review
// @access  Private (HOD)
router.get('/hod-list', auth(['HOD']), async (req, res) => {
    try {
        const requests = await StaffLeaveRequest.find({
            hod: req.user.id,
            status: 'Pending_HOD'
        }).populate('staff', 'name userId department photo');
        res.json(requests);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

router.get('/leave-schedule/:requestId', auth(['HOD']), async (req, res) => {
    try {
        const leaveReq = await StaffLeaveRequest.findById(req.params.requestId).populate('staff');
        if (!leaveReq) return res.status(404).json({ message: 'Request not found' });
        const staffName = leaveReq.staff.name;
        const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const dayName = daysOfWeek[new Date(leaveReq.startDate).getDay()];
        if (dayName === 'Sunday') return res.json([]);
        const allTimetables = await TimeTable.find().populate('department', 'name');
        const staffClasses = [];
        allTimetables.forEach(tt => {
            if (tt.schedule && tt.schedule[dayName]) {
                tt.schedule[dayName].forEach(slot => {
                    if (slot.staff === staffName && slot.subject !== 'Free' && !slot.isFixed) {
                        staffClasses.push({
                            ...slot.toObject ? slot.toObject() : slot,
                            departmentName: tt.department?.name,
                            departmentId: tt.department?._id,
                            semester: tt.semester,
                            section: tt.section,
                            day: dayName
                        });
                    }
                });
            }
        });
        res.json(staffClasses);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

router.get('/free-staff', auth(['HOD']), async (req, res) => {
    try {
        const { day, startTime } = req.query;
        if (!day || !startTime) return res.status(400).json({ message: 'Day and time are required' });
        const hod = await User.findById(req.user.id);
        const allStaff = await User.find({ role: 'Staff', department: hod.department }).select('name _id');
        const allTimetables = await TimeTable.find();
        const busyStaffSet = new Set();
        allTimetables.forEach(tt => {
            if (tt.schedule && tt.schedule[day]) {
                tt.schedule[day].forEach(slot => {
                    if (slot.startTime === startTime && slot.subject !== 'Free') { busyStaffSet.add(slot.staff.trim()); }
                });
            }
        });
        const freeStaff = allStaff.filter(s => !busyStaffSet.has(s.name));
        res.json(freeStaff);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// @route   POST api/staff-requests/hod-action
// @desc    HOD Approve/Reject staff leave
// @access  Private (HOD)
router.post('/hod-action', auth(['HOD']), async (req, res) => {
    const { requestId, action, remarks, substitutions } = req.body;
    try {
        const leaveReq = await StaffLeaveRequest.findById(requestId);
        if (!leaveReq) return res.status(404).json({ message: 'Request not found' });

        leaveReq.hodStatus = action;
        leaveReq.hodRemarks = remarks;

        if (action === 'Approved') {
            leaveReq.status = 'Approved';
            
            // Handle substitutions if provided
            if (substitutions && Array.isArray(substitutions)) {
                const subDocs = substitutions.map(sub => ({
                    date: leaveReq.startDate,
                    startTime: sub.startTime,
                    endTime: sub.endTime,
                    originalStaff: leaveReq.staff,
                    replacementStaff: sub.replacementStaffId,
                    subject: sub.subject,
                    department: sub.departmentId,
                    semester: sub.semester,
                    section: sub.section,
                    leaveRequest: requestId
                }));
                await ClassSubstitution.insertMany(subDocs);
            }
        } else {
            leaveReq.status = 'Rejected';
        }

        await leaveReq.save();
        res.json(leaveReq);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET api/staff-requests/my-substitutions
// @desc    Get classes assigned to me as a replacement
// @access  Private (Staff)
router.get('/my-substitutions', auth(['Staff', 'HOD']), async (req, res) => {
    try {
        const substitutions = await ClassSubstitution.find({
            replacementStaff: req.user.id,
            date: { $gte: new Date().setHours(0,0,0,0) }
        }).populate('originalStaff', 'name')
          .populate('department', 'name')
          .sort({ date: 1, startTime: 1 });
        
        res.json(substitutions);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// @route   POST api/staff-requests/mark-notified
// @desc    Clear notifications for substitutions
// @access  Private (Staff)
router.post('/mark-notified', auth(['Staff', 'HOD']), async (req, res) => {
    try {
        await ClassSubstitution.updateMany(
            { replacementStaff: req.user.id, notified: false },
            { $set: { notified: true } }
        );
        res.json({ message: 'Notified' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

module.exports = router;
