const mongoose = require('mongoose');

const BulkLeaveSchema = new mongoose.Schema({
    department: {
        type: String,
        required: true
    },
    scope: {
        type: String,
        enum: ['Department', 'Year', 'Class'],
        required: true
    },
    year: String, // Required if scope is Year or Class
    section: String, // Required if scope is Class
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    reason: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['Holiday', 'Event', 'Leave'],
        default: 'Leave'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('BulkLeave', BulkLeaveSchema);
