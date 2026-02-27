const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const LeaveRequest = require('../models/LeaveRequest');
const User = require('../models/User');

// @route   POST api/requests/leave
// @desc    Submit a leave/OD request
// @access  Private (Student)
router.post('/leave', auth(['Student']), async (req, res) => {
    try {
        const { type, subject, content, startDate, endDate, targetRecipient } = req.body;
        const student = await User.findById(req.user.id);

        // Find Class Coordinator
        const coordinator = await User.findOne({
            isCoordinator: true,
            'coordinatorDetails.department': student.department,
            'coordinatorDetails.semester': student.semester,
            'coordinatorDetails.section': student.section
        });

        // Find HOD
        const hod = await User.findOne({
            role: 'HOD',
            department: student.department
        });

        // Find Principal (First one found with Principal role)
        const principal = await User.findOne({ role: 'Principal' });

        const newRequest = new LeaveRequest({
            student: req.user.id,
            coordinator: coordinator ? coordinator._id : null,
            hod: hod ? hod._id : null,
            principal: principal ? principal._id : null,
            targetRecipient: targetRecipient || 'Class Advisor',
            type,
            subject,
            content,
            startDate,
            endDate,
            status: 'Pending_Coordinator'
        });

        await newRequest.save();
        res.json(newRequest);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET api/requests/my-requests
// @desc    Get student's own requests
// @access  Private (Student)
router.get('/my-requests', auth(['Student']), async (req, res) => {
    try {
        const requests = await LeaveRequest.find({ student: req.user.id })
            .populate('coordinator', 'name')
            .populate('hod', 'name')
            .populate('principal', 'name')
            .sort({ appliedAt: -1 });
        res.json(requests);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET api/requests/coordinator-list
// @desc    Get requests for coordinator review
// @access  Private (Staff/HOD)
router.get('/coordinator-list', auth(['Staff', 'HOD']), async (req, res) => {
    try {
        const requests = await LeaveRequest.find({
            coordinator: req.user.id,
            status: 'Pending_Coordinator'
        }).populate('student', 'name userId department semester section year');
        res.json(requests);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET api/requests/hod-list
// @desc    Get requests for HOD review
// @access  Private (HOD)
router.get('/hod-list', auth(['HOD']), async (req, res) => {
    try {
        const requests = await LeaveRequest.find({
            hod: req.user.id,
            status: 'Pending_HOD'
        }).populate('student', 'name userId department semester section year');
        res.json(requests);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET api/requests/principal-list
// @desc    Get requests for Principal review
// @access  Private (Principal)
router.get('/principal-list', auth(['Principal']), async (req, res) => {
    try {
        const requests = await LeaveRequest.find({
            principal: req.user.id,
            status: 'Pending_Principal'
        }).populate('student', 'name userId department semester section year');
        res.json(requests);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   POST api/requests/coordinator-action
// @desc    Coordinator Approve/Reject
// @access  Private (Staff/HOD)
router.post('/coordinator-action', auth(['Staff', 'HOD']), async (req, res) => {
    const { requestId, action, remarks } = req.body; // action: 'Approved' | 'Rejected'
    try {
        const leaveReq = await LeaveRequest.findById(requestId);
        if (!leaveReq) return res.status(404).json({ message: 'Request not found' });

        leaveReq.coordinatorStatus = action;
        leaveReq.coordinatorRemarks = remarks;

        if (action === 'Approved') {
            // Check if flow continues
            if (leaveReq.targetRecipient === 'Class Advisor') {
                leaveReq.status = 'Approved';
            } else {
                leaveReq.status = 'Pending_HOD';
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

// @route   POST api/requests/hod-action
// @desc    HOD Approve/Reject
// @access  Private (HOD)
router.post('/hod-action', auth(['HOD']), async (req, res) => {
    const { requestId, action, remarks } = req.body;
    try {
        const leaveReq = await LeaveRequest.findById(requestId);
        if (!leaveReq) return res.status(404).json({ message: 'Request not found' });

        leaveReq.hodStatus = action;
        leaveReq.hodRemarks = remarks;

        if (action === 'Approved') {
            if (leaveReq.targetRecipient === 'Principal' && leaveReq.principal) {
                leaveReq.status = 'Pending_Principal';
            } else {
                leaveReq.status = 'Approved';
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

// @route   POST api/requests/principal-action
// @desc    Principal Approve/Reject
// @access  Private (Principal)
router.post('/principal-action', auth(['Principal']), async (req, res) => {
    const { requestId, action, remarks } = req.body;
    try {
        const leaveReq = await LeaveRequest.findById(requestId);
        if (!leaveReq) return res.status(404).json({ message: 'Request not found' });

        leaveReq.principalStatus = action;
        leaveReq.principalRemarks = remarks;
        leaveReq.status = action === 'Approved' ? 'Approved' : 'Rejected';

        await leaveReq.save();
        res.json(leaveReq);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
