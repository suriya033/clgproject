const express = require('express');
const router = express.Router();
const User = require('../models/User');
const TimeTable = require('../models/TimeTable');
const Mark = require('../models/Mark');
const auth = require('../middleware/auth');
const Department = require('../models/Department'); // To get dept name if needed

// @desc    Get classes assigned to the logged-in staff
// @route   GET /api/marks/staff-classes
// @access  Private (Staff only)
router.get('/staff-classes', auth(['Staff', 'HOD']), async (req, res) => {
    try {
        const staffName = req.user.name;

        // Find all timetables
        // Note: Ideally, we should filter at DB level, but the structure is nested.
        // We'll fetch all and filter in memory for simplicity unless performance is an issue.
        const allTimetables = await TimeTable.find().populate('department');

        const classesSet = new Set();
        const classes = [];

        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

        allTimetables.forEach(tt => {
            // get dept name from populated object
            const deptName = tt.department ? tt.department.name : 'Unknown';

            days.forEach(day => {
                if (tt.schedule[day]) {
                    tt.schedule[day].forEach(slot => {
                        if (slot.staff && slot.staff.trim() === staffName.trim()) {
                            const key = `${deptName}-${tt.semester}-${tt.section}-${slot.subject}`;
                            if (!classesSet.has(key)) {
                                classesSet.add(key);
                                classes.push({
                                    department: deptName,
                                    semester: tt.semester,
                                    section: tt.section,
                                    subject: slot.subject,
                                    id: key
                                });
                            }
                        }
                    });
                }
            });
        });

        res.json(classes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Get students for a specific class + existing marks
// @route   GET /api/marks/students
// @access  Private (Staff)
router.get('/students', auth(['Staff', 'HOD']), async (req, res) => {
    const { department, semester, section, subject, examType } = req.query;

    if (!department || !semester || !section || !subject || !examType) {
        return res.status(400).json({ message: 'Missing query parameters' });
    }

    try {
        // 1. Find Students
        // Note: User schema stores 'department' as String usually, but check if it matches TimeTable's department name
        const students = await User.find({
            role: 'Student',
            department: department, // Assuming User.department stores the Name string, or we need to match appropriately
            semester: semester,
            section: section
        }).select('name userId _id photo');

        if (students.length === 0) {
            // Fallback: If no students found with specific semester/section (due to missing data), 
            // maybe return all students of that department for now for testing?
            // For now, strict filtering.
            return res.json([]);
        }

        // 2. Find Existing Marks
        const marks = await Mark.find({
            department,
            semester,
            section,
            subject,
            examType
        });

        // 3. Merge Data
        const studentData = students.map(student => {
            const markEntry = marks.find(m => m.student.toString() === student._id.toString());
            return {
                _id: student._id,
                name: student.name,
                regNo: student.userId,
                photo: student.photo,
                marks: markEntry ? markEntry.marks : '', // Empty string for no marks
                markId: markEntry ? markEntry._id : null
            };
        });

        res.json(studentData);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Update marks for a student
// @route   POST /api/marks/update
// @access  Private (Staff)
router.post('/update', auth(['Staff', 'HOD']), async (req, res) => {
    const { studentId, department, semester, section, subject, examType, marks } = req.body;

    try {
        let markEntry = await Mark.findOne({
            student: studentId,
            subject,
            examType
        });

        if (markEntry) {
            markEntry.marks = marks;
            markEntry.staff = req.user._id; // Update who edited last
            await markEntry.save();
        } else {
            markEntry = await Mark.create({
                student: studentId,
                staff: req.user._id,
                department,
                semester,
                section,
                subject,
                examType,
                marks
            });
        }

        res.json({ success: true, data: markEntry });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Get logged-in student's performance stats
// @route   GET /api/marks/my-performance
// @access  Private (Student)
router.get('/my-performance', auth(['Student']), async (req, res) => {
    try {
        const studentId = req.user.id;
        const marks = await Mark.find({ student: studentId });

        if (marks.length === 0) {
            return res.json({ cgpa: "0.0", percentage: "0.0", totalTests: 0 });
        }

        let totalMarksScored = 0;
        let totalMaxMarks = 0;

        marks.forEach(m => {
            totalMarksScored += m.marks;
            totalMaxMarks += m.maxMarks || 100;
        });

        const percentage = (totalMarksScored / totalMaxMarks) * 100;
        const cgpa = (percentage / 10).toFixed(2);

        res.json({
            cgpa: cgpa,
            percentage: percentage.toFixed(1),
            totalTests: marks.length
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Get logged-in student's detailed marks
// @route   GET /api/marks/my-marks
// @access  Private (Student)
router.get('/my-marks', auth(['Student']), async (req, res) => {
    try {
        const studentId = req.user.id;
        // Fetch all marks for the student
        const marks = await Mark.find({ student: studentId })
            .sort({ examType: 1, subject: 1 });

        res.json(marks);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;