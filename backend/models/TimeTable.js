const mongoose = require('mongoose');

const TimeTableSchema = new mongoose.Schema({
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
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
    schedule: {
        Monday: [
            {
                startTime: String,
                endTime: String,
                subject: String,
                staff: String,
                room: String
            }
        ],
        Tuesday: [{ startTime: String, endTime: String, subject: String, staff: String, room: String }],
        Wednesday: [{ startTime: String, endTime: String, subject: String, staff: String, room: String }],
        Thursday: [{ startTime: String, endTime: String, subject: String, staff: String, room: String }],
        Friday: [{ startTime: String, endTime: String, subject: String, staff: String, room: String }],
        Saturday: [{ startTime: String, endTime: String, subject: String, staff: String, room: String }]
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true });

// Compound index to ensure uniqueness for a class
TimeTableSchema.index({ department: 1, semester: 1, section: 1 }, { unique: true });

module.exports = mongoose.model('TimeTable', TimeTableSchema);
