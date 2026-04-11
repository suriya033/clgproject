const mongoose = require('mongoose');

const ClassSubstitutionSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true
    },
    startTime: String,
    endTime: String,
    originalStaff: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    replacementStaff: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    subject: String,
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department'
    },
    semester: String,
    section: String,
    leaveRequest: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'StaffLeaveRequest'
    },
    isAccepted: {
        type: Boolean,
        default: false
    },
    notified: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model('ClassSubstitution', ClassSubstitutionSchema);
