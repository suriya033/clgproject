const mongoose = require('mongoose');

const SeatingPlanSchema = new mongoose.Schema({
    examId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Exam',
        required: true
    },
    arrangement: [{
        hallId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ExamHall'
        },
        hallName: String,
        totalCapacity: Number,
        filledSeats: Number,
        benches: [{
            benchNo: Number,
            seats: [{
                seatNo: Number,
                student: {
                    _id: mongoose.Schema.Types.ObjectId,
                    userId: String,
                    name: String,
                    department: String,
                    year: String,
                    section: String
                }
            }]
        }]
    }],
    totalStudentsAssigned: {
        type: Number,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('SeatingPlan', SeatingPlanSchema);
