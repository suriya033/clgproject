const express = require('express');
const router = express.Router();
const User = require('../models/User');
const TimeTable = require('../models/TimeTable');
const Attendance = require('../models/Attendance');
const auth = require('../middleware/auth');

// @desc    Get classes assigned to the logged-in staff for TODAY
// @route   GET /api/attendance/staff-classes-today
// @access  Private (Staff only)
router.get('/staff-classes-today', auth(['Staff', 'HOD']), async (req, res) => {
    try {
        const staffName = req.user.name;
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const queryDate = req.query.date ? new Date(req.query.date) : new Date();
        const today = days[queryDate.getDay()];

        if (today === 'Sunday') {
            return res.json([]);
        }

        const allTimetables = await TimeTable.find().populate('department');
        const classes = [];

        allTimetables.forEach(tt => {
            const deptName = tt.department ? tt.department.name : 'Unknown';

            if (tt.schedule[today]) {
                tt.schedule[today].forEach((slot, index) => {
                    if (slot.staff && slot.staff.trim() === staffName.trim()) {
                        classes.push({
                            department: deptName,
                            semester: tt.semester,
                            section: tt.section,
                            subject: slot.subject,
                            startTime: slot.startTime,
                            endTime: slot.endTime,
                            period: String(index + 1), // Using index + 1 as period number
                            id: `${deptName}-${tt.semester}-${tt.section}-${slot.subject}-${index}`
                        });
                    }
                });
            }
        });

        res.json(classes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Get students for a specific class to mark attendance
// @route   GET /api/attendance/students
// @access  Private (Staff)
router.get('/students', auth(['Staff', 'HOD']), async (req, res) => {
    const { department, semester, section, subject, date, period } = req.query;

    if (!department || !semester || !section || !subject) {
        return res.status(400).json({ message: 'Missing parameters' });
    }

    try {
        const queryDate = date ? new Date(date) : new Date();
        queryDate.setHours(0, 0, 0, 0);

        // 1. Find Students
        const students = await User.find({
            role: 'Student',
            department: department,
            semester: semester,
            section: section
        }).select('name userId _id photo').sort({ name: 1 });

        // 2. Find Existing Attendance for these students on this date/period
        const attendanceRecords = await Attendance.find({
            department,
            semester,
            section,
            subject,
            period,
            date: {
                $gte: queryDate,
                $lt: new Date(queryDate.getTime() + 24 * 60 * 60 * 1000)
            }
        });

        // 3. Merge Data
        const studentData = students.map(student => {
            const record = attendanceRecords.find(r => r.student.toString() === student._id.toString());
            return {
                _id: student._id,
                name: student.name,
                userId: student.userId,
                photo: student.photo,
                status: record ? record.status : 'P' // Default to Present if no record
            };
        });

        res.json(studentData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Submit attendance for multiple students
// @route   POST /api/attendance/bulk-update
// @access  Private (Staff)
router.post('/bulk-update', auth(['Staff', 'HOD']), async (req, res) => {
    const { attendanceData, classDetails } = req.body;
    const { department, semester, section, subject, period, date } = classDetails;

    try {
        const queryDate = date ? new Date(date) : new Date();
        queryDate.setHours(0, 0, 0, 0);

        const operations = attendanceData.map(item => ({
            updateOne: {
                filter: {
                    student: item.studentId,
                    subject,
                    period,
                    date: {
                        $gte: queryDate,
                        $lt: new Date(queryDate.getTime() + 24 * 60 * 60 * 1000)
                    }
                },
                update: {
                    $set: {
                        student: item.studentId,
                        staff: req.user._id,
                        department,
                        semester,
                        section,
                        subject,
                        period,
                        date: queryDate,
                        status: item.status
                    }
                },
                upsert: true
            }
        }));

        await Attendance.bulkWrite(operations);
        res.json({ success: true, message: 'Attendance updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Get logged-in student's attendance percentage
// @route   GET /api/attendance/my-percentage
// @access  Private (Student)
router.get('/my-percentage', auth(['Student']), async (req, res) => {
    try {
        const studentId = req.user.id;

        const totalPeriods = await Attendance.countDocuments({ student: studentId });
        const attendedPeriods = await Attendance.countDocuments({
            student: studentId,
            status: { $in: ['P', 'OD'] }
        });

        const percentage = totalPeriods > 0 ? ((attendedPeriods / totalPeriods) * 100).toFixed(1) : "0.0";

        res.json({
            percentage: percentage,
            attended: attendedPeriods,
            total: totalPeriods
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Get logged-in student's attendance records for a specific month
// @route   GET /api/attendance/my-record
// @access  Private (Student)
router.get('/my-record', auth(['Student']), async (req, res) => {
    try {
        const studentId = req.user.id;
        const { month, year } = req.query;

        const date = new Date();
        const currentMonth = month ? parseInt(month) : date.getMonth();
        const currentYear = year ? parseInt(year) : date.getFullYear();

        const startDate = new Date(currentYear, currentMonth, 1);
        const endDate = new Date(currentYear, currentMonth + 1, 0);
        endDate.setHours(23, 59, 59, 999);

        const records = await Attendance.find({
            student: studentId,
            date: {
                $gte: startDate,
                $lte: endDate
            }
        }).sort({ date: 1, period: 1 });

        res.json(records);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
