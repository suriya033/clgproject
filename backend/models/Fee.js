const mongoose = require('mongoose');

const FeeSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: ['Tuition', 'Hostel', 'Transport', 'Exam', 'Library', 'Other']
    },
    status: {
        type: String,
        required: true,
        enum: ['Paid', 'Pending', 'Partial'],
        default: 'Pending'
    },
    dueDate: Date,
    paidDate: Date,
    transactionId: String,
    remarks: String
}, { timestamps: true });

module.exports = mongoose.model('Fee', FeeSchema);
