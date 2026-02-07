const mongoose = require('mongoose');

const ComplaintSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    studentName: {
        type: String,
        required: true
    },
    department: {
        type: String,
        required: true
    },
    year: {
        type: String, // E.g., '1', '2'
        required: true
    },
    section: {
        type: String,
    },
    recipient: {
        type: String,
        enum: ['Admin', 'HOD'],
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Resolved', 'Dismissed'],
        default: 'Pending'
    },
    resolutionNote: {
        type: String
    }
}, { timestamps: true });

module.exports = mongoose.model('Complaint', ComplaintSchema);
