const mongoose = require('mongoose');

const ClassSchema = new mongoose.Schema({
    name: {
        type: String,
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
    coordinator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    academicYear: {
        type: String,
        required: true
    }
}, { timestamps: true });

// Ensure unique class per dept/sem/sec/year
ClassSchema.index({ department: 1, semester: 1, section: 1, academicYear: 1 }, { unique: true });

module.exports = mongoose.model('Class', ClassSchema);
