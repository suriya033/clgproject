const Exam = require('../models/Exam');
const ExamHall = require('../models/ExamHall');
const User = require('../models/User'); // Where Students are stored with role='Student'
const SeatingPlan = require('../models/SeatingPlan');

// @desc    Generate Seating Arrangement using CSP AI Algorithm
// @route   POST /api/exam-room/generate
// @access  Private (Admin/ExamCell)
exports.generateSeating = async (req, res) => {
    try {
        const { examId, examIds, selectedHallIds } = req.body;

        let ids = examIds || (examId ? [examId] : []);
        if (ids.length === 0 || !selectedHallIds || selectedHallIds.length === 0) {
            return res.status(400).json({ success: false, message: 'Please provide exam(s) and selected halls.' });
        }

        const exams = await Exam.find({ _id: { $in: ids } });
        if (exams.length === 0) {
            return res.status(404).json({ success: false, message: 'Exam(s) not found.' });
        }

        const halls = await ExamHall.find({ _id: { $in: selectedHallIds } });
        if (halls.length === 0) {
            return res.status(404).json({ success: false, message: 'Halls not found.' });
        }

        let orQueries = [];
        for (let exam of exams) {
            let singleQuery = { role: 'Student' };
            if (exam.participatingDepartments && exam.participatingDepartments.length > 0) {
                const depts = exam.participatingDepartments.map(d => d.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).filter(d => !!d);
                singleQuery.department = { $in: depts.map(d => new RegExp(`^\\s*${d}\\s*$`, 'i')) };
            }
            if (exam.year) {
                const years = exam.year.split(',').map(y => y.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).filter(y => !!y);
                singleQuery.year = { $in: years.map(y => new RegExp(`^\\s*${y}\\s*$`, 'i')) };
            }
            if (exam.semester) {
                const sems = exam.semester.split(',').map(s => s.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).filter(s => !!s);
                singleQuery.semester = { $in: sems.map(s => new RegExp(`^\\s*${s}\\s*$`, 'i')) };
            }
            if (exam.section) {
                const secs = exam.section.split(',').map(s => s.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).filter(s => !!s);
                singleQuery.section = { $in: secs.map(s => new RegExp(`^\\s*${s}\\s*$`, 'i')) };
            }
            orQueries.push(singleQuery);
        }

        let studentQuery = orQueries.length > 1 ? { $or: orQueries } : orQueries[0];
        const students = await User.find(studentQuery).select('_id userId name department year semester section');

        if (students.length === 0) {
            return res.status(400).json({ success: false, message: 'No students found for the provided selection.' });
        }

        // Update total students in Exam documents for reference
        for (let exam of exams) {
            // We'll update the first one to hold length for now or skip it if it's multiple 
            // Better to skip modifying exams if there are multiple or distribute it if needed. 
            // For now, let's keep it simple: 
            exam.totalStudents = students.length;
            await exam.save();
        }

        // RUN CSP AI ALGORITHM
        let totalSeats = halls.reduce((sum, h) => sum + h.totalSeats, 0);
        if (students.length > totalSeats) {
            return res.status(400).json({
                success: false,
                message: `Hard Capacity Blocked: Total students (${students.length}) exceed total available capacity (${totalSeats}) in selected halls.`
            });
        }

        // 1. Group students by class (department + year + semester + section)
        let studentsByClass = {};
        students.forEach(sDoc => {
            let s = sDoc.toObject ? sDoc.toObject() : sDoc;
            let classKey = `${s.department}-${s.year}-${s.semester}-${s.section || ''}`;
            if (!studentsByClass[classKey]) {
                studentsByClass[classKey] = {
                    name: classKey,
                    department: s.department,
                    students: []
                };
            }
            studentsByClass[classKey].students.push(s);
        });

        // Mix students randomly within their class array to avoid alphabetic deterministic seating
        Object.keys(studentsByClass).forEach(cls => {
            studentsByClass[cls].students = studentsByClass[cls].students.sort(() => 0.5 - Math.random());
        });

        let classes = Object.keys(studentsByClass).map(c => ({
            name: c,
            department: studentsByClass[c].department,
            count: studentsByClass[c].students.length,
            students: studentsByClass[c].students
        }));

        // 2. Interleave Benches across halls to ensure "Balanced distribution per hall"
        let maxBenches = Math.max(...halls.map(h => h.benches));
        let interleavedBenches = [];
        for (let b = 1; b <= maxBenches; b++) {
            halls.forEach(hall => {
                if (b <= hall.benches) {
                    interleavedBenches.push({
                        hallId: hall._id,
                        hallName: hall.hallName,
                        benchNo: b,
                        seatsPerBench: hall.seatsPerBench,
                        seats: []
                    });
                }
            });
        }

        // 3. Iterative Greedy CSP Assignment
        let remainingStudents = students.length;
        let maxSeatsPerBench = Math.max(...interleavedBenches.map(b => b.seatsPerBench));

        let emptySeats = [];
        for (let s = 1; s <= maxSeatsPerBench; s++) {
            for (let bench of interleavedBenches) {
                if (s <= bench.seatsPerBench) {
                    emptySeats.push({ bench: bench, seatNo: s, filled: false });
                }
            }
        }

        let passLevel = 1;

        while (remainingStudents > 0 && passLevel <= 3) {
            let placedInThisPass = false;

            for (let seatInfo of emptySeats) {
                if (remainingStudents === 0) break;
                if (seatInfo.filled) continue;

                let bench = seatInfo.bench;

                // Priority Queue: Sort classes by remaining count descending
                classes.sort((a, b) => b.count - a.count);

                let selectedClassIndex = -1;

                if (passLevel === 1) {
                    // Pass 1: Strict Mode - Find class with students remaining, DIFFERENT department from this bench
                    selectedClassIndex = classes.findIndex(c =>
                        c.count > 0 && !bench.seats.some(seat => seat.department === c.department)
                    );
                } else if (passLevel === 2) {
                    // Pass 2: Semi-Strict Mode - Same department allowed, but DIFFERENT class
                    selectedClassIndex = classes.findIndex(c =>
                        c.count > 0 && !bench.seats.some(seat => seat.classKey === c.name)
                    );
                } else {
                    // Pass 3: Relaxed Mode - If impossible, fallback to highest remaining
                    selectedClassIndex = classes.findIndex(c => c.count > 0);
                }

                if (selectedClassIndex !== -1) {
                    let selectedClass = classes[selectedClassIndex];
                    let student = selectedClass.students.pop();
                    selectedClass.count--;
                    remainingStudents--;
                    seatInfo.filled = true;

                    bench.seats.push({
                        seatNo: seatInfo.seatNo,
                        classKey: selectedClass.name,
                        department: selectedClass.department,
                        student: student
                    });

                    placedInThisPass = true;
                }
            }

            if (!placedInThisPass && remainingStudents > 0) {
                passLevel++; // Relax constraint globally for remaining students since no one could be placed
            }
        }

        // 4. Reconstruct Output format Grouped by Hall
        let allocationByHall = {};
        halls.forEach(h => {
            allocationByHall[h._id] = {
                hallId: h._id,
                hallName: h.hallName,
                totalCapacity: h.totalSeats,
                filledSeats: 0,
                benches: []
            };
        });

        interleavedBenches.forEach(b => {
            if (b.seats.length > 0) {
                allocationByHall[b.hallId].benches.push({
                    benchNo: b.benchNo,
                    seats: b.seats
                });
                allocationByHall[b.hallId].filledSeats += b.seats.length;
            }
        });

        const finalArrangement = Object.values(allocationByHall).filter(h => h.benches.length > 0);

        return res.status(200).json({
            success: true,
            exam: {
                name: exams.map(e => e.examName).join(' + '),
                date: exams[0].date,
                subjectCode: exams.map(e => e.subjectCode).join(' + ')
            },
            totalStudentsAssigned: students.length,
            arrangement: finalArrangement // Send to frontend for viewing/export
        });

    } catch (error) {
        console.error("CSP Seating Generate Error: ", error);
        res.status(500).json({ success: false, message: 'Server error generating seating arrangement' });
    }
};

// @desc    Create new Exam
// @route   POST /api/exam-room/exam
exports.createExam = async (req, res) => {
    try {
        const exam = new Exam(req.body);
        await exam.save();
        res.status(201).json({ success: true, data: exam });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all Exams
// @route   GET /api/exam-room/exams
exports.getExams = async (req, res) => {
    try {
        const exams = await Exam.find().sort({ date: -1 });
        res.status(200).json({ success: true, data: exams });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update Exam
// @route   PUT /api/exam-room/exam/:id
exports.updateExam = async (req, res) => {
    try {
        const exam = await Exam.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });
        res.status(200).json({ success: true, data: exam });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete Exam
// @route   DELETE /api/exam-room/exam/:id
exports.deleteExam = async (req, res) => {
    try {
        const exam = await Exam.findByIdAndDelete(req.params.id);
        if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });
        res.status(200).json({ success: true, message: 'Exam deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Create new Exam Hall
// @route   POST /api/exam-room/hall
exports.createHall = async (req, res) => {
    try {
        const payload = { ...req.body };
        // calculate totalSeats here to satisfy Mongoose validation
        if (payload.benches) {
            payload.totalSeats = Number(payload.benches) * Number(payload.seatsPerBench || 2);
        }

        const hall = new ExamHall(payload);
        await hall.save();
        res.status(201).json({ success: true, data: hall });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all Exam Halls
// @route   GET /api/exam-room/halls
exports.getHalls = async (req, res) => {
    try {
        const halls = await ExamHall.find().sort({ hallName: 1 });
        res.status(200).json({ success: true, data: halls });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update an Exam Hall
// @route   PUT /api/exam-room/hall/:id
exports.updateHall = async (req, res) => {
    try {
        const payload = { ...req.body };
        if (payload.benches && payload.seatsPerBench) {
            payload.totalSeats = Number(payload.benches) * Number(payload.seatsPerBench);
        } else if (payload.benches) {
            const existingHall = await ExamHall.findById(req.params.id);
            payload.totalSeats = Number(payload.benches) * (existingHall ? existingHall.seatsPerBench : 2);
        } else if (payload.seatsPerBench) {
            const existingHall = await ExamHall.findById(req.params.id);
            payload.totalSeats = (existingHall ? existingHall.benches : 0) * Number(payload.seatsPerBench);
        }

        const hall = await ExamHall.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });
        if (!hall) {
            return res.status(404).json({ success: false, message: 'Hall not found' });
        }
        res.status(200).json({ success: true, data: hall });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete an Exam Hall
// @route   DELETE /api/exam-room/hall/:id
exports.deleteHall = async (req, res) => {
    try {
        const hall = await ExamHall.findByIdAndDelete(req.params.id);
        if (!hall) {
            return res.status(404).json({ success: false, message: 'Hall not found' });
        }
        res.status(200).json({ success: true, message: 'Hall deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Save the tweaked seating plan
// @route   POST /api/exam-room/save-plan
exports.savePlan = async (req, res) => {
    try {
        const { examId, arrangement, totalStudentsAssigned } = req.body;

        let plan = await SeatingPlan.findOne({ examId });
        if (plan) {
            plan.arrangement = arrangement;
            plan.totalStudentsAssigned = totalStudentsAssigned;
            await plan.save();
        } else {
            plan = new SeatingPlan({ examId, arrangement, totalStudentsAssigned });
            await plan.save();
        }

        res.status(200).json({ success: true, message: 'Seating plan saved successfully', plan });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get count of students based on criteria
// @route   POST /api/exam-room/student-count
exports.getStudentCount = async (req, res) => {
    try {
        const { department, year, semester, section } = req.body;

        let query = { role: 'Student' };

        if (department) {
            const depts = department.split(',').map(d => d.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).filter(d => !!d);
            query.department = { $in: depts.map(d => new RegExp(`^\\s*${d}\\s*$`, 'i')) };
        }
        if (year) {
            const years = year.split(',').map(y => y.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).filter(y => !!y);
            query.year = { $in: years.map(y => new RegExp(`^\\s*${y}\\s*$`, 'i')) };
        }
        if (semester) {
            const sems = semester.split(',').map(s => s.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).filter(s => !!s);
            query.semester = { $in: sems.map(s => new RegExp(`^\\s*${s}\\s*$`, 'i')) };
        }
        if (section) {
            const secs = section.split(',').map(s => s.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).filter(s => !!s);
            query.section = { $in: secs.map(s => new RegExp(`^\\s*${s}\\s*$`, 'i')) };
        }

        const count = await User.countDocuments(query);
        res.status(200).json({ success: true, count });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
