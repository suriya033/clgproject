const Exam = require('../models/Exam');
const ExamHall = require('../models/ExamHall');
const User = require('../models/User'); // Where Students are stored with role='Student'

// @desc    Generate Seating Arrangement using CSP AI Algorithm
// @route   POST /api/exam-room/generate
// @access  Private (Admin/ExamCell)
exports.generateSeating = async (req, res) => {
    try {
        const { examId, selectedHallIds } = req.body;

        if (!examId || !selectedHallIds || selectedHallIds.length === 0) {
            return res.status(400).json({ success: false, message: 'Please provide examId and selected halls.' });
        }

        const exam = await Exam.findById(examId);
        if (!exam) {
            return res.status(404).json({ success: false, message: 'Exam not found.' });
        }

        const halls = await ExamHall.find({ _id: { $in: selectedHallIds } });
        if (halls.length === 0) {
            return res.status(404).json({ success: false, message: 'Halls not found.' });
        }

        // Fetch students belonging to the participating departments for this exam
        const students = await User.find({
            role: 'Student',
            department: { $in: exam.participatingDepartments }
        }).select('_id userId name department year section');

        if (students.length === 0) {
            return res.status(400).json({ success: false, message: 'No students found for the participating departments.' });
        }

        // Update total students in Exam document for reference
        exam.totalStudents = students.length;
        await exam.save();

        // RUN CSP AI ALGORITHM
        let totalSeats = halls.reduce((sum, h) => sum + h.totalSeats, 0);
        if (students.length > totalSeats) {
            return res.status(400).json({
                success: false,
                message: `Hard Capacity Blocked: Total students (${students.length}) exceed total available capacity (${totalSeats}) in selected halls.`
            });
        }

        // 1. Group students by department
        let studentsByDept = {};
        students.forEach(s => {
            if (!studentsByDept[s.department]) stdByDept = [];
            if (!studentsByDept[s.department]) studentsByDept[s.department] = [];
            studentsByDept[s.department].push(s);
        });

        // Mix students randomly within their department array to avoid alphabetic deterministic seating
        Object.keys(studentsByDept).forEach(dept => {
            studentsByDept[dept] = studentsByDept[dept].sort(() => 0.5 - Math.random());
        });

        let depts = Object.keys(studentsByDept).map(d => ({
            name: d,
            count: studentsByDept[d].length,
            students: studentsByDept[d]
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

        for (let bench of interleavedBenches) {
            if (remainingStudents === 0) break;

            for (let s = 1; s <= bench.seatsPerBench; s++) {
                if (remainingStudents === 0) break;

                // Priority Queue: Sort depts by remaining count descending
                depts.sort((a, b) => b.count - a.count);

                // Pass 1: Strict Mode - Find department with students remaining, NOT present on this bench
                let selectedDeptIndex = depts.findIndex(d =>
                    d.count > 0 && !bench.seats.some(seat => seat.student.department === d.name)
                );

                // Pass 2: Relaxed Mode - If impossible (e.g. only 1 dept left), fallback to highest remaining
                if (selectedDeptIndex === -1) {
                    selectedDeptIndex = depts.findIndex(d => d.count > 0);
                }

                if (selectedDeptIndex !== -1) {
                    let selectedDept = depts[selectedDeptIndex];
                    let student = selectedDept.students.pop();
                    selectedDept.count--;
                    remainingStudents--;

                    bench.seats.push({
                        seatNo: s,
                        student: student
                    });
                }
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
                name: exam.examName,
                date: exam.date,
                subjectCode: exam.subjectCode
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
