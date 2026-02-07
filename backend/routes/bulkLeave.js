const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const BulkLeave = require('../models/BulkLeave');
const User = require('../models/User');

// @route   POST api/bulk-leave
// @desc    Create bulk leave for dept/year/class
// @access  Private (HOD/Admin)
router.post('/', auth(['HOD', 'Admin']), async (req, res) => {
    try {
        const { scope, year, section, startDate, endDate, reason, type } = req.body;
        const department = req.user.department; // HOD's dept

        const newBulkLeave = new BulkLeave({
            department,
            scope,
            year,
            section,
            startDate,
            endDate,
            reason,
            type,
            createdBy: req.user.id
        });

        await newBulkLeave.save();
        res.json({ message: 'Bulk leave declared successfully', data: newBulkLeave });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET api/bulk-leave/my-dept
// @desc    Get bulk leaves for HOD's dept
// @access  Private (HOD)
router.get('/my-dept', auth(['HOD']), async (req, res) => {
    try {
        const leaves = await BulkLeave.find({ department: req.user.department })
            .sort({ startDate: -1 });
        res.json(leaves);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
