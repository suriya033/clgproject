const express = require('express');
const router = express.Router();
const TimeTable = require('../models/TimeTable');
const auth = require('../middleware/auth');

// Generate Timetable (AI/Algorithmic)
router.post('/generate', auth(['Admin', 'HOD', 'Office']), async (req, res) => {
    try {
        const { subjects, slotsPerDay = 7, days = 5, classes } = req.body;

        let batch = [];
        if (classes && Array.isArray(classes)) {
            batch = classes;
        } else {
            // Backward compatibility for single class entry
            if (!subjects || subjects.length === 0) {
                return res.status(400).json({ message: 'No subjects provided' });
            }
            batch = [{ subjects, metadata: {} }];
        }

        const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const activeDays = weekDays.slice(0, days);
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

        // Initialize structures for each class
        const results = batch.map(c => ({
            metadata: c.metadata || {},
            subjects: c.subjects,
            schedule: {},
            lastSubject: null,
            dailyLimits: {},
            tasks: []
        }));

        // Global staff tracker: { day: { slotIndex: Set([staffId/Name]) } }
        const globalStaffBusy = {};
        activeDays.forEach(day => {
            globalStaffBusy[day] = timeSlots.map(() => new Set());
            results.forEach(r => {
                r.schedule[day] = [];
                r.dailyLimits[day] = {};
            });
        });

        // Prepare tasks for each class with priority
        results.forEach(r => {
            r.subjects.forEach(sub => {
                const hours = parseInt(sub.hoursPerWeek) || 3;
                for (let i = 0; i < hours; i++) {
                    r.tasks.push({
                        name: sub.name,
                        subjectId: sub.subjectId,
                        staff: sub.staffName || sub.staffId || 'TBD',
                        staffId: sub.staffId
                    });
                }
            });
            // Shuffle tasks initially
            r.tasks.sort(() => Math.random() - 0.5);
        });

        // Fill slots day by day, slot by slot across ALL classes
        for (const day of activeDays) {
            timeSlots.forEach((slotTime, slotIndex) => {
                if (slotTime.includes('Break') || slotTime.includes('Lunch')) {
                    results.forEach(r => {
                        r.schedule[day].push({
                            startTime: slotTime.split(' - ')[0],
                            endTime: slotTime.split(' - ')[1],
                            subject: slotTime.includes('Break') ? 'Break' : 'Lunch',
                            staff: '-',
                            isFixed: true
                        });
                        r.lastSubject = null;
                    });
                    return;
                }

                const busyInThisSlot = globalStaffBusy[day][slotIndex];

                // Shuffle results order each slot to give each class a fair chance at staff
                const shuffledIndices = results.map((_, i) => i).sort(() => Math.random() - 0.5);

                shuffledIndices.forEach(idx => {
                    const r = results[idx];

                    // Filter tasks that satisfy STRICT constraints:
                    // 1. Staff not already busy in ANOTHER class this slot
                    // 2. Not same as last subject (STRICTLY no back-to-back)
                    // 3. Not already scheduled more than twice this day (STRICTLY max 2)

                    const validCandidateIndices = [];
                    r.tasks.forEach((t, tIdx) => {
                        const isConsecutive = t.name === r.lastSubject;
                        const dailyCount = r.dailyLimits[day][t.name] || 0;
                        const staffBusy = busyInThisSlot.has(t.staff);

                        if (!isConsecutive && dailyCount < 2 && !staffBusy) {
                            validCandidateIndices.push(tIdx);
                        }
                    });

                    if (validCandidateIndices.length > 0) {
                        // Pick a random task from pool of valid candidates
                        const randomIndex = Math.floor(Math.random() * validCandidateIndices.length);
                        const taskIdx = validCandidateIndices[randomIndex];
                        const task = r.tasks[taskIdx];

                        r.schedule[day].push({
                            startTime: slotTime.split(' - ')[0],
                            endTime: slotTime.split(' - ')[1],
                            subject: task.name,
                            staff: task.staff,
                            room: 'Room 101'
                        });

                        r.lastSubject = task.name;
                        r.dailyLimits[day][task.name] = (r.dailyLimits[day][task.name] || 0) + 1;
                        busyInThisSlot.add(task.staff);
                        r.tasks.splice(taskIdx, 1);
                    } else {
                        // If no subject meets strict criteria, assign a Free period
                        r.schedule[day].push({
                            startTime: slotTime.split(' - ')[0],
                            endTime: slotTime.split(' - ')[1],
                            subject: 'Free',
                            staff: '-',
                            room: '-'
                        });
                        r.lastSubject = 'Free';
                    }
                });
            });
        }

        if (classes) {
            res.json(results.map(r => ({
                metadata: r.metadata,
                schedule: r.schedule,
                subjects: r.subjects // Return subjects for display
            })));
        } else {
            res.json(results[0].schedule);
        }

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
