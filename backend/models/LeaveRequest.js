const mongoose = require('mongoose');

const LeaveRequestSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    coordinator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    hod: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    principal: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    targetRecipient: {
        type: String,
        enum: ['Class Advisor', 'HOD', 'Principal'],
        default: 'Class Advisor'
    },
    type: {
        type: String,
        enum: ['Leave', 'OD'],
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    content: {
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
    status: {
        type: String,
        enum: ['Pending_Coordinator', 'Pending_HOD', 'Pending_Principal', 'Approved', 'Rejected'],
        default: 'Pending_Coordinator'
    },
    coordinatorStatus: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
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
    coordinatorRemarks: String,
    hodRemarks: String,
    principalRemarks: String,
    appliedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model('LeaveRequest', LeaveRequestSchema);
