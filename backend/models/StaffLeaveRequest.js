const mongoose = require('mongoose');

const StaffLeaveRequestSchema = new mongoose.Schema({
    staff: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    hod: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    principal: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    leaveType: {
        type: String,
        enum: ['Casual Leave', 'Sick Leave', 'On Duty (OD)', 'Emergency Leave', 'Others'],
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    reason: {
        type: String,
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    alternateArrangement: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending_HOD', 'Pending_Principal', 'Approved', 'Rejected'],
        default: 'Pending_HOD'
    },
    hodStatus: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
    },
    principalStatus: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
    },
    hodRemarks: String,
    principalRemarks: String,
    appliedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model('StaffLeaveRequest', StaffLeaveRequestSchema);
