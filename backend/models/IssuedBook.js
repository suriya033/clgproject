const mongoose = require('mongoose');

const IssuedBookSchema = new mongoose.Schema({
    book: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LibraryItem',
        required: true
    },
    studentId: {
        type: String,
        required: true
    },
    studentName: {
        type: String,
        required: true
    },
    bookTitle: {
        type: String,
        required: true
    },
    issueDate: {
        type: Date,
        default: Date.now
    },
    dueDate: {
        type: Date,
        required: true
    },
    returnDate: {
        type: Date
    },
    status: {
        type: String,
        enum: ['Issued', 'Returned'],
        default: 'Issued'
    }
});

module.exports = mongoose.model('IssuedBook', IssuedBookSchema);
