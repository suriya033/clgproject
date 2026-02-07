const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    staff: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    department: {
        type: String,
        required: true
    },
    semester: {
        type: String,
        required: true
    },
    section: {
        type: String,
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['P', 'A', 'OD'],
        default: 'P'
    },
    period: {
        type: String // or slot number
    }
}, { timestamps: true });

// Index for quick queries
AttendanceSchema.index({ student: 1, date: 1, period: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', AttendanceSchema);
