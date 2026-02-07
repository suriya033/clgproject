const mongoose = require('mongoose');

const SubjectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    shortName: {
        type: String,
        required: true
    },
    code: {
        type: String,
        required: true,
        unique: true
    },
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
        required: true
    },
    year: {
        type: String,
        required: true
    },
    semester: {
        type: String,
        required: true
    },
    credits: {
        type: Number,
        default: 3
    },
    type: {
        type: String,
        enum: ['Theory', 'Practical'],
        default: 'Theory'
    },
    duration: {
        type: Number,
        default: 1 // Default to 1 period
    }
}, { timestamps: true });

module.exports = mongoose.model('Subject', SubjectSchema);
