const express = require('express');
const router = express.Router();
const TimeTable = require('../models/TimeTable');
const Announcement = require('../models/Announcement');
const Department = require('../models/Department');
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
            '09:15 - 10:05',
            '10:05 - 10:55',
            '10:55 - 11:15 (Break)',
            '11:15 - 12:05',
            '12:05 - 12:55',
            '12:55 - 1:45 (Lunch)',
            '1:45 - 2:30',
            '2:30 - 3:15',
            '3:15 - 3:25 (Break)',
            '3:25 - 4:05',
            '4:05 - 4:55'
        ];

        // Initialize structures for each class
        const results = batch.map(c => ({
            metadata: c.metadata || {},
            subjects: c.subjects,
            schedule: {},
            lastSubject: null,
            dailyLimits: {},
            theoryTasks: [],
            practicalTasks: []
        }));

        // Global staff tracker: { day: { slotIndex: Set([staffId/Name]) } }
        const globalStaffBusy = {};
        activeDays.forEach(day => {
            globalStaffBusy[day] = timeSlots.map(() => new Set());
            results.forEach(r => {
                r.schedule[day] = timeSlots.map((slotTime, idx) => {
                    const isFixed = slotTime.includes('Break') || slotTime.includes('Lunch');
                    return {
                        startTime: slotTime.split(' - ')[0],
                        endTime: slotTime.split(' - ')[1],
                        subject: isFixed ? (slotTime.includes('Break') ? 'Break' : 'Lunch') : null,
                        staff: isFixed ? '-' : null,
                        isFixed
                    };
                });
                r.dailyLimits[day] = {};
            });
        });

        // Prepare tasks
        results.forEach(r => {
            // Map to track primary lab staff and pre-calculate alternative coverage
            const primaryLabStaffMap = {}; // { subjectId: staffName }
            const altCoverage = {}; // { subjectId: hours }

            r.subjects.forEach(sub => {
                // Determine primary lab staff for this subject
                const labStaff = sub.type === 'Integrated' ?
                    (sub.hasSeparateLabStaff ? (sub.labStaffName || sub.labStaffId) : (sub.staffName || sub.staffId)) :
                    (sub.type === 'Practical' ? (sub.staffName || sub.staffId) : null);

                if (labStaff && sub.subjectId) {
                    primaryLabStaffMap[sub.subjectId] = labStaff;
                }

                if (sub.alternative && sub.alternative.subjectId) {
                    const labDur = parseInt(sub.duration) || 2;
                    const labSessions = parseInt(sub.sessions) || 1;
                    const coverage = labDur * labSessions;
                    altCoverage[sub.alternative.subjectId] = (altCoverage[sub.alternative.subjectId] || 0) + coverage;
                }
            });

            r.subjects.forEach(sub => {
                const totalHours = parseInt(sub.hoursPerWeek) || 3;
                const duration = parseInt(sub.duration) || 1;

                // Ensure alternative uses primary staff if available to avoid "two staff" problem
                if (sub.alternative && sub.alternative.subjectId && primaryLabStaffMap[sub.alternative.subjectId]) {
                    sub.alternative.staffName = primaryLabStaffMap[sub.alternative.subjectId];
                }

                if (sub.type === 'Integrated') {
                    // Handle LAB part
                    const subLabHours = parseInt(sub.labHours) || 0;
                    // Deduct hours if this subject's lab is already covered by being an alternative elsewhere
                    const labTotal = Math.max(0, subLabHours - (altCoverage[sub.subjectId] || 0));

                    const labDur = parseInt(sub.duration) || 2;
                    let labRemaining = labTotal;

                    const effectiveLabStaff = sub.hasSeparateLabStaff ? (sub.labStaffName || sub.labStaffId) : (sub.staffName || sub.staffId);
                    const effectiveLabStaffId = sub.hasSeparateLabStaff ? sub.labStaffId : sub.staffId;

                    while (labRemaining >= labDur) {
                        r.practicalTasks.push({
                            name: sub.name,
                            subjectId: sub.subjectId,
                            staff: effectiveLabStaff || 'TBD',
                            staffId: effectiveLabStaffId,
                            duration: labDur,
                            alternative: sub.alternative
                        });
                        labRemaining -= labDur;
                    }
                    // Handle THEORY part
                    const theoryTotal = parseInt(sub.theoryHours) || 0;
                    for (let i = 0; i < theoryTotal; i++) {
                        r.theoryTasks.push({
                            name: sub.name,
                            subjectId: sub.subjectId,
                            staff: sub.staffName || sub.staffId || 'TBD',
                            staffId: sub.staffId
                        });
                    }
                } else if (sub.type === 'Practical' && duration > 1) {
                    // Create blocks for Practicals
                    const subLabHours = totalHours;
                    const labTotal = Math.max(0, subLabHours - (altCoverage[sub.subjectId] || 0));

                    let hoursRemaining = labTotal;
                    while (hoursRemaining >= duration) {
                        r.practicalTasks.push({
                            name: sub.name,
                            subjectId: sub.subjectId,
                            staff: sub.staffName || sub.staffId || 'TBD',
                            staffId: sub.staffId,
                            duration: duration,
                            alternative: sub.alternative
                        });
                        hoursRemaining -= duration;
                    }
                    // Any leftover stays as single hours
                    for (let i = 0; i < hoursRemaining; i++) {
                        r.theoryTasks.push({
                            name: sub.name,
                            subjectId: sub.subjectId,
                            staff: sub.staffName || sub.staffId || 'TBD',
                            staffId: sub.staffId
                        });
                    }
                } else {
                    for (let i = 0; i < totalHours; i++) {
                        r.theoryTasks.push({
                            name: sub.name,
                            subjectId: sub.subjectId,
                            staff: sub.staffName || sub.staffId || 'TBD',
                            staffId: sub.staffId
                        });
                    }
                }
            });
            // Shuffle initially
            r.theoryTasks.sort(() => Math.random() - 0.5);
            r.practicalTasks.sort(() => Math.random() - 0.5);
        });

        // 1. PLACE PRACTICAL BLOCKS (Strategic Placement)
        activeDays.forEach(day => {
            const shuffledResults = [...results].sort(() => Math.random() - 0.5);

            shuffledResults.forEach(r => {
                if (r.practicalTasks.length === 0) return;

                // Priority: One practical per day per class
                const taskIdx = r.practicalTasks.findIndex(t => !r.dailyLimits[day][t.name]);
                if (taskIdx === -1) return;

                const task = r.practicalTasks[taskIdx];
                const duration = task.duration;

                // Strategic Scan: Prefer afternoon (after lunch) for labs, then morning
                const preferredStartIndices = [
                    ...Array.from({ length: timeSlots.length - 6 }, (_, i) => i + 6), // Post-lunch indices
                    ...Array.from({ length: 6 }, (_, i) => i) // Morning indices
                ].filter(idx => idx <= timeSlots.length - duration);

                for (const startIdx of preferredStartIndices) {
                    let canFit = true;
                    let actualIndices = [];
                    let currentIndex = startIdx;

                    while (actualIndices.length < duration && currentIndex < timeSlots.length) {
                        const slot = r.schedule[day][currentIndex];

                        // Check main staff availability
                        const staffBusy = globalStaffBusy[day][currentIndex].has(task.staff);

                        // Check alternative staff availability if exists
                        let altStaffBusy = false;
                        if (task.alternative && task.alternative.staffName) {
                            altStaffBusy = globalStaffBusy[day][currentIndex].has(task.alternative.staffName);
                        }

                        if (slot.isFixed) {
                            if (slot.subject === 'Lunch') {
                                canFit = false;
                                break;
                            }
                            currentIndex++;
                            continue;
                        }

                        if (slot.subject || staffBusy || altStaffBusy) {
                            canFit = false;
                            break;
                        }

                        actualIndices.push(currentIndex);
                        currentIndex++;
                    }

                    if (canFit && actualIndices.length === duration) {
                        const finalEndIdx = actualIndices[actualIndices.length - 1];

                        let subjectText = task.name;
                        let staffText = task.staff;

                        if (task.alternative) {
                            subjectText = `${task.name} / ${task.alternative.name}`;
                            staffText = (task.staff === task.alternative.staffName) ? task.staff : `${task.staff} / ${task.alternative.staffName}`;
                        }

                        for (let i = startIdx; i <= finalEndIdx; i++) {
                            const currentSlot = r.schedule[day][i];
                            if (currentSlot.isFixed) {
                                globalStaffBusy[day][i].add(task.staff);
                                if (task.alternative) globalStaffBusy[day][i].add(task.alternative.staffName);
                                continue;
                            }
                            currentSlot.subject = subjectText;
                            currentSlot.staff = staffText;
                            currentSlot.room = 'Lab';

                            globalStaffBusy[day][i].add(task.staff);
                            if (task.alternative) globalStaffBusy[day][i].add(task.alternative.staffName);
                        }
                        r.dailyLimits[day][task.name] = (r.dailyLimits[day][task.name] || 0) + 1;
                        r.practicalTasks.splice(taskIdx, 1);
                        break;
                    }
                }
            });
        });

        // 2. FILL THEORY (Balanced Distribution Across Remaining Slots)
        for (const day of activeDays) {
            // Reset lastSubject at the start of the day so it doesn't block the first slot based on yesterday
            results.forEach(r => r.lastSubject = null);

            // Process slots sequentially
            for (let slotIndex = 0; slotIndex < timeSlots.length; slotIndex++) {
                if (results[0].schedule[day][slotIndex].isFixed) {
                    // If fixed slot (Break/Lunch), it breaks the consecutive chain naturally
                    results.forEach(r => r.lastSubject = null);
                    continue;
                }

                const shuffledIndices = results.map((_, i) => i).sort(() => Math.random() - 0.5);
                shuffledIndices.forEach(idx => {
                    const r = results[idx];
                    if (r.schedule[day][slotIndex].subject) return;

                    const busyInThisSlot = globalStaffBusy[day][slotIndex];

                    // Priority: Theory subjects with THE MOST remaining tasks first
                    r.theoryTasks.sort((a, b) => {
                        const countA = r.theoryTasks.filter(t => t.name === a.name).length;
                        const countB = r.theoryTasks.filter(t => t.name === b.name).length;
                        return countB - countA;
                    });

                    const taskIdx = r.theoryTasks.findIndex(t => {
                        const isConsecutive = t.name === r.lastSubject;
                        const dailyCount = r.dailyLimits[day][t.name] || 0;
                        const staffBusy = busyInThisSlot.has(t.staff);

                        // Check for 3 continuous theory hours for the same staff
                        let staffTheoryCount = 0;
                        for (let p = slotIndex - 1; p >= 0; p--) {
                            if (results[0].schedule[day][p].isFixed) continue;

                            if (globalStaffBusy[day][p].has(t.staff)) {
                                let wasTheoryInfo = false;
                                for (const classObj of results) {
                                    const slotInfo = classObj.schedule[day][p];
                                    if (slotInfo && slotInfo.staff && typeof slotInfo.staff === 'string' && slotInfo.staff.includes(t.staff) && slotInfo.room !== 'Lab') {
                                        wasTheoryInfo = true;
                                        break;
                                    }
                                }
                                if (wasTheoryInfo) {
                                    staffTheoryCount++;
                                } else {
                                    break; // Was a practical (Lab), chain of theory hours is broken
                                }
                            } else {
                                break; // Was free, chain is broken
                            }
                        }
                        const isContinuousTheoryOverload = staffTheoryCount >= 2;

                        // Allow up to 3 periods per day to accommodate 10-15 hour subjects
                        return !isConsecutive && dailyCount < 3 && !staffBusy && !isContinuousTheoryOverload;
                    });

                    if (taskIdx !== -1) {
                        const task = r.theoryTasks[taskIdx];
                        r.schedule[day][slotIndex].subject = task.name;
                        r.schedule[day][slotIndex].staff = task.staff;
                        r.schedule[day][slotIndex].room = 'Room 101';

                        r.lastSubject = task.name;
                        r.dailyLimits[day][task.name] = (r.dailyLimits[day][task.name] || 0) + 1;
                        busyInThisSlot.add(task.staff);
                        r.theoryTasks.splice(taskIdx, 1);
                    } else {
                        r.schedule[day][slotIndex].subject = 'Free';
                        r.schedule[day][slotIndex].staff = '-';
                        r.schedule[day][slotIndex].room = '-';
                        // IMPORTANT: Reset lastSubject so the next slot isn't blocked by the ghost of the previous subject
                        r.lastSubject = null;
                    }
                });
            }
        }

        if (classes) {
            res.json(results.map(r => ({
                metadata: r.metadata,
                schedule: r.schedule,
                subjects: r.subjects
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
            timetable.createdBy = req.user.id;
            await timetable.save();
        } else {
            timetable = new TimeTable({
                department,
                semester,
                section,
                schedule,
                createdBy: req.user.id
            });
            await timetable.save();
        }

        // Create an announcement for the staff
        try {
            const deptObj = await Department.findById(department);
            const announcement = new Announcement({
                title: 'Timetable Updated',
                content: `New timetable published for ${deptObj?.name || 'Department'}, ${semester} - Sec ${section}.`,
                targetRoles: ['Staff', 'HOD'],
                department: deptObj?.name || 'All',
                createdBy: req.user.id
            });
            await announcement.save();
        } catch (noticeErr) {
            console.error('Failed to create announcement:', noticeErr);
        }

        res.json({ message: 'Timetable saved successfully', timetable });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Get classes for logged-in Staff (used for CIA marks etc)
router.get('/staff-classes', auth(['Staff', 'HOD']), async (req, res) => {
    try {
        const staffName = req.user.name;
        const allTimetables = await TimeTable.find().populate('department', 'name');

        const classesMap = new Map();

        allTimetables.forEach(tt => {
            if (!tt.schedule) return;

            Object.values(tt.schedule).forEach(daySlots => {
                daySlots.forEach(slot => {
                    if (slot.staff === staffName) {
                        const classKey = `${tt.department?._id}-${tt.semester}-${tt.section}-${slot.subject}`;
                        if (!classesMap.has(classKey)) {
                            classesMap.set(classKey, {
                                departmentId: tt.department?._id,
                                departmentName: tt.department?.name || 'Unknown',
                                semester: tt.semester,
                                section: tt.section,
                                subjectName: slot.subject
                            });
                        }
                    }
                });
            });
        });

        const classes = Array.from(classesMap.values());
        res.json(classes);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Get consolidated weekly schedule for logged-in Staff
router.get('/my-schedule', auth(['Staff', 'HOD']), async (req, res) => {
    try {
        const staffName = req.user.name;
        const allTimetables = await TimeTable.find().populate('department', 'name');

        const schedule = {
            Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [], Saturday: []
        };

        allTimetables.forEach(tt => {
            if (!tt.schedule) return;
            Object.keys(tt.schedule).forEach(day => {
                if (schedule[day]) {
                    tt.schedule[day].forEach(slot => {
                        if (slot.staff === staffName) {
                            schedule[day].push({
                                ...slot.toObject ? slot.toObject() : slot,
                                department: tt.department?.name || 'Unknown',
                                semester: tt.semester,
                                section: tt.section
                            });
                        }
                    });
                }
            });
        });

        // Sort each day's slots by startTime
        Object.keys(schedule).forEach(day => {
            schedule[day].sort((a, b) => {
                const timeA = a.startTime || "";
                const timeB = b.startTime || "";
                return timeA.localeCompare(timeB);
            });
        });

        res.json(schedule);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

router.get('/:department/:semester/:section', auth(), async (req, res) => {
    try {
        const { department, semester, section } = req.params;
        console.log(`FETCH TIMETABLE -> Dept: [${department}], Sem: [${semester}], Sec: [${section}]`);
        const timetable = await TimeTable.findOne({ department, semester, section });

        if (!timetable) {
            console.log('TIMETABLE NOT FOUND IN DB');
            return res.json({ exists: false });
        }
        res.json(timetable);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
