const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    fee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Fee',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    method: {
        type: String,
        enum: ['UPI', 'Card', 'NetBanking', 'Wallet', 'Other'],
        default: 'Other'
    },
    transactionId: { // Razorpay Payment ID
        type: String,
        unique: true,
        sparse: true
    },
    razorpayOrderId: {
        type: String,
        required: true,
        unique: true
    },
    razorpaySignature: String,
    status: {
        type: String,
        enum: ['Created', 'Success', 'Failed', 'Refunded'],
        default: 'Created'
    },
    paymentDate: Date,
    receiptUrl: String // Path to receipt if stored or boolean flag indicating it is available
}, { timestamps: true });

module.exports = mongoose.model('Payment', PaymentSchema);
