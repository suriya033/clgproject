const mongoose = require('mongoose');

const MarkSchema = new mongoose.Schema({
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
    examType: {
        type: String,
        required: true,
        enum: ['CIA 1', 'CIA 2', 'CIA 3']
    },
    marks: {
        type: Number,
        required: true,
        default: 0
    },
    maxMarks: {
        type: Number,
        default: 100
    },
    date: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Ensure one mark entry per student per subject per exam
MarkSchema.index({ student: 1, subject: 1, examType: 1 }, { unique: true });

module.exports = mongoose.model('Mark', MarkSchema);
