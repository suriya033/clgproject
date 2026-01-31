const express = require('express');
const router = express.Router();
const TimeTable = require('../models/TimeTable');
const auth = require('../middleware/auth');

// Generate Timetable (AI/Algorithmic)
router.post('/generate', auth(['Admin', 'HOD', 'Office']), async (req, res) => {
    try {
        const { subjects, slotsPerDay = 7, days = 5 } = req.body;
        // subjects: [{ name, code, hoursPerWeek, staffName }]

        if (!subjects || subjects.length === 0) {
            return res.status(400).json({ message: 'No subjects provided' });
        }

        const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const activeDays = weekDays.slice(0, days);
        // Smart Scheduling Algorithm
        const schedule = {};
        const dailyLimits = {}; // Track usage per day
        const subjectCounts = {}; // Track total assigned

        // Initialize structures
        activeDays.forEach(day => {
            schedule[day] = [];
            dailyLimits[day] = {};
        });

        // Create a pool of tasks with priority
        let tasks = [];
        subjects.forEach(sub => {
            const hours = parseInt(sub.hoursPerWeek) || 3;
            subjectCounts[sub.name] = 0;
            // Weigh tasks by remaining hours needed
            for (let i = 0; i < hours; i++) {
                tasks.push({
                    subject: sub.name,
                    staff: sub.staffName || 'TBD',
                    id: sub.subjectId // Keep ID for reference
                });
            }
        });

        // Sort tasks random initially
        tasks.sort(() => Math.random() - 0.5);

        // Define Time Slots (Standard College 7-hour day)
        const timeSlots = [
            '09:00 - 09:50',
            '09:50 - 10:40',
            '10:40 - 11:00 (Break)',
            '11:00 - 11:50',
            '11:50 - 12:40',
            '12:40 - 01:30 (Lunch)',
            '01:30 - 02:20',
            '02:20 - 03:10',
            '03:10 - 04:00'
        ];

        // Fill slots
        for (const day of activeDays) {
            let lastSubject = null;

            for (const slotTime of timeSlots) {
                if (slotTime.includes('Break') || slotTime.includes('Lunch')) {
                    schedule[day].push({
                        startTime: slotTime.split(' - ')[0],
                        endTime: slotTime.split(' - ')[1],
                        subject: slotTime.includes('Break') ? 'Break' : 'Lunch',
                        staff: '-',
                        isFixed: true
                    });
                    lastSubject = null; // Reset consecutive check after break
                    continue;
                }

                // Find a suitable task for this slot
                // Criteria: 
                // 1. Not same as last subject (avoid consecutive)
                // 2. Not already scheduled more than twice this day

                // Prioritize tasks that meet criteria:
                // 1. Not same as last subject
                // 2. Not already scheduled more than twice

                // Shuffle tasks a bit to ensure variety if multiple candidates exist
                // We use a simple strategy: Find first valid, or best effort
                let taskIndex = -1;

                // First pass: Find strictly valid task
                taskIndex = tasks.findIndex(t => {
                    const isConsecutive = t.subject === lastSubject;
                    const dailyCount = dailyLimits[day][t.subject] || 0;
                    return !isConsecutive && dailyCount < 2;
                });

                let assignedTask = null;

                if (taskIndex !== -1) {
                    assignedTask = tasks[taskIndex];
                    tasks.splice(taskIndex, 1);
                } else if (tasks.length > 0) {
                    // Second pass: Relax "consecutive" if we really have to, but keep "max 2" if possible
                    taskIndex = tasks.findIndex(t => {
                        const dailyCount = dailyLimits[day][t.subject] || 0;
                        return dailyCount < 2;
                    });

                    if (taskIndex !== -1) {
                        assignedTask = tasks[taskIndex];
                        tasks.splice(taskIndex, 1);
                    } else {
                        // Fallback: Must violate max 2 constraint (very rare if logic is sound)
                        assignedTask = tasks.shift();
                    }
                }

                if (assignedTask) {
                    schedule[day].push({
                        startTime: slotTime.split(' - ')[0],
                        endTime: slotTime.split(' - ')[1],
                        subject: assignedTask.subject,
                        staff: assignedTask.staff,
                        room: 'Room 101'
                    });

                    // Update constraints
                    lastSubject = assignedTask.subject;
                    dailyLimits[day][assignedTask.subject] = (dailyLimits[day][assignedTask.subject] || 0) + 1;
                } else {
                    schedule[day].push({
                        startTime: slotTime.split(' - ')[0],
                        endTime: slotTime.split(' - ')[1],
                        subject: 'Free',
                        staff: '-',
                        room: '-'
                    });
                    lastSubject = 'Free';
                }
            }
        }

        res.json(schedule);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Save Timetable
router.post('/save', auth(['Admin', 'HOD', 'Office']), async (req, res) => {
    try {
        const { department, semester, section, schedule } = req.body;

        // Check if exists
        let timetable = await TimeTable.findOne({ department, semester, section });

        if (timetable) {
            timetable.schedule = schedule;
            await timetable.save();
        } else {
            timetable = new TimeTable({
                department,
                semester,
                section,
                schedule
            });
            await timetable.save();
        }

        res.json({ message: 'Timetable saved successfully', timetable });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Get Timetable
router.get('/:department/:semester/:section', auth(), async (req, res) => {
    try {
        const { department, semester, section } = req.params;
        const timetable = await TimeTable.findOne({ department, semester, section });

        if (!timetable) {
            return res.status(404).json({ message: 'Timetable not found' });
        }
        res.json(timetable);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
