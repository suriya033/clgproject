const mongoose = require('mongoose');

const ExamSchema = new mongoose.Schema({
    examName: {
        type: String,
        required: true,
        trim: true
    },
    subjectCode: {
        type: String,
        required: true,
        trim: true
    },
    date: {
        type: Date,
        required: true
    },
    participatingDepartments: [{
        type: String,
        required: true
    }],
    totalStudents: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

module.exports = mongoose.model('Exam', ExamSchema);
