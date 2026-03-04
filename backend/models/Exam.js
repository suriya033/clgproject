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
    subjectName: {
        type: String,
        trim: true
    },
    date: {
        type: Date,
        required: true
    },
    year: {
        type: String,
        trim: true
    },
    semester: {
        type: String,
        trim: true
    },
    section: {
        type: String,
        trim: true
    },
    participatingDepartments: [{
        type: String,
        required: true
    }],
    totalStudents: {
        type: Number,
        default: 0
    },
    session: {
        type: String,
        enum: ['Forenoon', 'Afternoon']
    }
}, { timestamps: true });

module.exports = mongoose.model('Exam', ExamSchema);
