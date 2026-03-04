const mongoose = require('mongoose');

const ExamHallSchema = new mongoose.Schema({
    hallName: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    benches: {
        type: Number,
        required: true
    },
    seatsPerBench: {
        type: Number,
        required: true,
        default: 2
    },
    totalSeats: {
        type: Number,
        required: true
    },
    building: {
        type: String,
        trim: true
    },
    floor: {
        type: String,
        trim: true
    }
}, { timestamps: true });



module.exports = mongoose.model('ExamHall', ExamHallSchema);
